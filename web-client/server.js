const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();

// DEBUG: Verificar variables de entorno
console.log('🔍 Variables de entorno cargadas:');
console.log('   - AUTH_SERVER_URL:', process.env.AUTH_SERVER_URL);
console.log('   - CLIENT_ID:', process.env.CLIENT_ID);
console.log('   - REDIRECT_URI:', process.env.REDIRECT_URI);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configuración OAuth con valores por defecto
const oauthConfig = {
  clientId: process.env.CLIENT_ID || 'web-client-123',
  clientSecret: process.env.CLIENT_SECRET || 'web-secret-456',
  authServerUrl: process.env.AUTH_SERVER_URL || 'http://localhost:3001',
  resourceServerUrl: process.env.RESOURCE_SERVER_URL || 'http://localhost:3002',
  redirectUri: process.env.REDIRECT_URI || 'http://localhost:3000/callback',
  scope: 'profile email'
};

console.log('🔧 Configuración OAuth final:');
console.log('   - authServerUrl:', oauthConfig.authServerUrl);
console.log('   - clientId:', oauthConfig.clientId);
console.log('   - redirectUri:', oauthConfig.redirectUri);

// Almacenamiento simple en memoria (en producción usar sesiones/DB)
const userSessions = new Map();

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar flujo OAuth
app.get('/login', (req, res) => {
  try {
    const state = Math.random().toString(36).substring(7);
    
    // Construir URL manualmente para evitar problemas
    const authUrl = `${oauthConfig.authServerUrl}/oauth/authorize?` +
      `client_id=${encodeURIComponent(oauthConfig.clientId)}` +
      `&redirect_uri=${encodeURIComponent(oauthConfig.redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(oauthConfig.scope)}` +
      `&state=${encodeURIComponent(state)}`;

    // Guardar state en sesión (simplificado)
    userSessions.set(state, { timestamp: Date.now() });

    console.log('🔐 Redirigiendo a:', authUrl);
    res.redirect(authUrl);

  } catch (error) {
    console.error('❌ Error en /login:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Callback - intercambiar código por token
app.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.send(`Error de autorización: ${error}`);
  }

  if (!code) {
    return res.send('No se recibió código de autorización');
  }

  try {
    // Intercambiar código por token
    const tokenResponse = await axios.post(`${oauthConfig.authServerUrl}/oauth/token`, 
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: oauthConfig.redirectUri,
        client_id: oauthConfig.clientId,
        client_secret: oauthConfig.clientSecret
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, refresh_token, scope } = tokenResponse.data;

    // Redirigir a página de perfil con el token
    res.redirect(`/profile?access_token=${access_token}`);

  } catch (error) {
    console.error('Error obteniendo token:', error.response?.data || error.message);
    res.send(`Error obteniendo token: ${error.response?.data?.error_description || error.message}`);
  }
});

// Página de perfil (protegida)
app.get('/profile', async (req, res) => {
  const accessToken = req.query.access_token;

  if (!accessToken) {
    return res.redirect('/');
  }

  try {
    // Obtener datos del perfil del usuario
    const profileResponse = await axios.get(`${oauthConfig.resourceServerUrl}/api/profile`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Perfil de Usuario</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .profile { background: #f5f5f5; padding: 20px; border-radius: 8px; }
          .token { background: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 4px; word-break: break-all; font-size: 12px; }
          .btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block; }
        </style>
      </head>
      <body>
        <h1>🎉 ¡Login Exitoso!</h1>
        
        <div class="profile">
          <h2>Perfil del Usuario</h2>
          <pre>${JSON.stringify(profileResponse.data, null, 2)}</pre>
        </div>

        <div style="margin-top: 20px;">
          <h3>Token de Acceso:</h3>
          <div class="token">${accessToken}</div>
        </div>

        <div style="margin-top: 20px;">
          <a href="/api-test?access_token=${accessToken}" class="btn">Probar API</a>
          <a href="/" class="btn" style="background: #6c757d;">Volver al Inicio</a>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    res.send(`Error obteniendo perfil: ${error.response?.data?.error_description || error.message}`);
  }
});

// Página para probar diferentes endpoints de la API
app.get('/api-test', async (req, res) => {
  const accessToken = req.query.access_token;

  if (!accessToken) {
    return res.redirect('/');
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Pruebas de API</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .endpoint { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .btn { background: #007bff; color: white; padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block; margin: 5px; }
        .result { background: white; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-top: 10px; }
      </style>
    </head>
    <body>
      <h1>🔧 Pruebas de API</h1>
      <p>Token: <code>${accessToken.substring(0, 50)}...</code></p>
      
      <div class="endpoint">
        <h3>Perfil del Usuario</h3>
        <button class="btn" onclick="testEndpoint('/api/profile')">Probar /api/profile</button>
        <div id="profile-result" class="result"></div>
      </div>

      <div class="endpoint">
        <h3>Email del Usuario</h3>
        <button class="btn" onclick="testEndpoint('/api/email')">Probar /api/email</button>
        <div id="email-result" class="result"></div>
      </div>

      <div style="margin-top: 20px;">
        <a href="/profile?access_token=${accessToken}" class="btn" style="background: #6c757d;">Volver al Perfil</a>
      </div>

      <script>
        async function testEndpoint(endpoint) {
          const resultDiv = document.getElementById(endpoint.replace('/', '-').substring(1) + '-result');
          resultDiv.innerHTML = 'Cargando...';
          
          try {
            const response = await fetch('${oauthConfig.resourceServerUrl}' + endpoint, {
              headers: {
                'Authorization': 'Bearer ${accessToken}'
              }
            });
            
            const data = await response.json();
            resultDiv.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
          } catch (error) {
            resultDiv.innerHTML = 'Error: ' + error.message;
          }
        }
      </script>
    </body>
    </html>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Web Client' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Web Client running on port ${PORT}`);
  console.log(`📍 Abre http://localhost:${PORT} en tu navegador`);
});