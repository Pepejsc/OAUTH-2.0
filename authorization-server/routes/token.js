const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const AuthorizationCode = require('../models/AuthorizationCode');
const { PKCEUtils } = require('../utils/crypto');
const jwt = require('jsonwebtoken');

// POST /token - Obtener tokens (múltiples grant types)
router.post('/token', async (req, res) => {
  console.log('🔐 Solicitud POST /token recibida');
  console.log('   - Grant Type:', req.body.grant_type);
  console.log('   - Client ID:', req.body.client_id);

  try {
    const {
      grant_type,
      code,
      redirect_uri,
      client_id,
      client_secret,
      code_verifier,
      scope
    } = req.body;

    // Validar parámetros básicos
    if (!grant_type || !client_id) {
      return res.status(400).json({ error: 'invalid_request', error_description: 'Missing required parameters' });
    }

    // Buscar cliente
    const client = await Client.findOne({ clientId: client_id });
    if (!client) {
      return res.status(400).json({ error: 'invalid_client' });
    }

    // PROCESAR DIFERENTES GRANT TYPES
    switch (grant_type) {
      
      // 🔐 AUTHORIZATION CODE FLOW
      case 'authorization_code':
        return await handleAuthorizationCode(req, res, client, client_secret);
      
      // 🤖 CLIENT CREDENTIALS FLOW  
      case 'client_credentials':
        return await handleClientCredentials(req, res, client, client_secret, scope);
      
      default:
        return res.status(400).json({ error: 'unsupported_grant_type' });
    }

  } catch (error) {
    console.error('❌ Error in /token:', error);
    res.status(500).json({ error: 'server_error' });
  }
});

// Handler para Authorization Code
async function handleAuthorizationCode(req, res, client, client_secret) {
  const { code, redirect_uri, code_verifier } = req.body;

  if (!code || !redirect_uri) {
    return res.status(400).json({ error: 'invalid_request' });
  }

  // Validar cliente confidencial
  if (client.clientType === 'confidential' && client_secret !== client.clientSecret) {
    return res.status(400).json({ error: 'invalid_client' });
  }

  // Buscar código de autorización
  const authCode = await AuthorizationCode.findOne({ code });
  if (!authCode || authCode.redirectUri !== redirect_uri) {
    return res.status(400).json({ error: 'invalid_grant' });
  }

  // Validar expiración
  if (authCode.expiresAt < new Date()) {
    await AuthorizationCode.deleteOne({ code });
    return res.status(400).json({ error: 'invalid_grant', error_description: 'Authorization code expired' });
  }

  // Validar PKCE
  if (authCode.codeChallenge) {
    if (!code_verifier) {
      return res.status(400).json({ error: 'invalid_request', error_description: 'Code verifier required' });
    }
    
    const isValid = PKCEUtils.validateCodeChallenge(
      code_verifier,
      authCode.codeChallenge,
      authCode.codeChallengeMethod
    );
    
    if (!isValid) {
      return res.status(400).json({ error: 'invalid_grant', error_description: 'Invalid code verifier' });
    }
  }

  // Generar tokens
  const accessToken = jwt.sign(
    {
      sub: authCode.userId,
      client_id: client.clientId,
      scope: authCode.scope,
      token_type: 'access'
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    {
      sub: authCode.userId,
      client_id: client.clientId,
      token_type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  // Limpiar código usado
  await AuthorizationCode.deleteOne({ code });

  res.json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: refreshToken,
    scope: authCode.scope.join(' ')
  });
}

// Handler para Client Credentials
async function handleClientCredentials(req, res, client, client_secret, scope) {
  // Validar cliente confidencial
  if (client.clientType !== 'confidential') {
    return res.status(400).json({ error: 'unauthorized_client', error_description: 'Client credentials grant requires confidential client' });
  }

  // Validar client_secret
  if (!client_secret || client_secret !== client.clientSecret) {
    return res.status(400).json({ error: 'invalid_client' });
  }

  // Validar que el cliente tenga permiso para este grant
  if (!client.grants.includes('client_credentials')) {
    return res.status(400).json({ error: 'unauthorized_client', error_description: 'Client not authorized for client_credentials grant' });
  }

  // Determinar scopes
  let finalScopes = client.scopes;
  if (scope) {
    const requestedScopes = scope.split(' ');
    finalScopes = requestedScopes.filter(s => client.scopes.includes(s));
  }

  // Generar token para el cliente (no hay usuario involucrado)
  const accessToken = jwt.sign(
    {
      client_id: client.clientId,
      scope: finalScopes,
      token_type: 'access',
      grant_type: 'client_credentials'
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  console.log('✅ Token Client Credentials generado para:', client.clientId);
  console.log('   - Scopes:', finalScopes);

  res.json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    scope: finalScopes.join(' ')
  });
}

module.exports = router;