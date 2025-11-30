const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Client = require('../models/Client');
const AuthorizationCode = require('../models/AuthorizationCode');
const { PKCEUtils } = require('../utils/crypto');

// GET /authorize - Iniciar flujo OAuth
router.get('/authorize', async (req, res) => {
  try {
    const {
      client_id,
      redirect_uri,
      response_type,
      scope,
      state,
      code_challenge,
      code_challenge_method = 'S256'
    } = req.query;

    // Validaciones básicas
    if (!client_id || !redirect_uri) {
      return res.status(400).json({ error: 'invalid_request', error_description: 'Missing required parameters' });
    }

    if (response_type !== 'code') {
      return res.status(400).json({ error: 'unsupported_response_type' });
    }

    // Buscar cliente
    const client = await Client.findOne({ clientId: client_id });
    if (!client) {
      return res.status(400).json({ error: 'invalid_client' });
    }

    // Validar redirect_uri
    if (!client.redirectUris.includes(redirect_uri)) {
      return res.status(400).json({ error: 'invalid_request', error_description: 'Invalid redirect URI' });
    }

    // Validar PKCE
    if (code_challenge && !['S256', 'plain'].includes(code_challenge_method)) {
      return res.status(400).json({ error: 'invalid_request', error_description: 'Invalid code challenge method' });
    }

    // SIMULACIÓN: En una app real aquí iría la pantalla de login
    // Por ahora simulamos un usuario demo
    const demoUser = {
      id: 'user-123',
      username: 'demo',
      email: 'demo@example.com'
    };

    // Generar código de autorización
    const authCode = crypto.randomBytes(16).toString('hex');
    
    const authorizationCode = new AuthorizationCode({
      code: authCode,
      clientId: client_id,
      redirectUri: redirect_uri,
      userId: demoUser.id,
      scope: scope ? scope.split(' ') : [],
      codeChallenge: code_challenge,
      codeChallengeMethod: code_challenge_method
    });

    await authorizationCode.save();

    // Redirigir con código
    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.set('code', authCode);
    if (state) redirectUrl.searchParams.set('state', state);

    res.redirect(redirectUrl.toString());
    
  } catch (error) {
    console.error('Error in /authorize:', error);
    res.status(500).json({ error: 'server_error' });
  }
});

module.exports = router;