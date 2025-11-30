const axios = require('axios');
const crypto = require('crypto');

// Configuración
const config = {
  authServerUrl: 'http://localhost:3001',
  clientId: 'mobile-client-456',
  redirectUri: 'com.oauth.demo://callback',
  scope: 'profile openid'
};

// Utilidades PKCE
class PKCEDemo {
  static generateCodeVerifier() {
    return crypto.randomBytes(32).toString('base64url');
  }

  static generateCodeChallenge(codeVerifier) {
    return crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
  }

  static async runPKCEFlow() {
    console.log('🚀 INICIANDO DEMO PKCE (Mobile Client)');
    console.log('=' .repeat(50));

    // Paso 1: Generar PKCE code verifier y challenge
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = this.generateCodeChallenge(codeVerifier);

    console.log('📱 Paso 1: Generar PKCE Parameters');
    console.log('   - Code Verifier:', codeVerifier);
    console.log('   - Code Challenge:', codeChallenge);
    console.log();

    // Paso 2: Construir URL de autorización
    const authUrl = `${config.authServerUrl}/oauth/authorize?` +
      `client_id=${encodeURIComponent(config.clientId)}` +
      `&redirect_uri=${encodeURIComponent(config.redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(config.scope)}` +
      `&code_challenge=${encodeURIComponent(codeChallenge)}` +
      `&code_challenge_method=S256` +
      `&state=pkce_demo_123`;

    console.log('🔐 Paso 2: URL de Autorización');
    console.log('   ', authUrl);
    console.log();

    // Simular que el usuario autoriza y obtenemos el código
    console.log('👤 Paso 3: Simular autorización del usuario...');
    
    try {
      // Hacer solicitud de autorización
      const authResponse = await axios.get(authUrl, {
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400; // Aceptar redirects
        }
      });

      // En una app real, aquí se capturaría la redirección
      console.log('✅ Autorización exitosa (simulada)');
      console.log('   - Location Header:', authResponse.headers.location);
      
      // Extraer código de la URL de redirección (simulado)
      const redirectUrl = new URL(authResponse.headers.location);
      const authCode = redirectUrl.searchParams.get('code');
      
      if (!authCode) {
        throw new Error('No se recibió código de autorización');
      }

      console.log('   - Código de Autorización:', authCode);
      console.log();

      // Paso 4: Intercambiar código por token
      console.log('🔄 Paso 4: Intercambiar código por token...');
      
      const tokenResponse = await axios.post(
        `${config.authServerUrl}/oauth/token`,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: authCode,
          redirect_uri: config.redirectUri,
          client_id: config.clientId,
          code_verifier: codeVerifier  // ◀️ PKCE: enviar code_verifier
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const { access_token, token_type, expires_in, scope } = tokenResponse.data;

      console.log('✅ Token obtenido exitosamente!');
      console.log('   - Access Token:', access_token);
      console.log('   - Token Type:', token_type);
      console.log('   - Expires In:', expires_in, 'segundos');
      console.log('   - Scope:', scope);
      console.log();

      // Paso 5: Usar el token para acceder a recursos
      console.log('📡 Paso 5: Acceder a API protegida...');
      
      const apiResponse = await axios.get(
        'http://localhost:3002/api/profile',
        {
          headers: {
            'Authorization': `${token_type} ${access_token}`
          }
        }
      );

      console.log('✅ API accedida exitosamente!');
      console.log('   - Datos:', JSON.stringify(apiResponse.data, null, 2));
      console.log();

      // Demostración de seguridad PKCE
      console.log('🛡️ DEMOSTRACIÓN DE SEGURIDAD PKCE:');
      console.log('   - Sin PKCE: Atacante podría interceptar el código');
      console.log('   - Con PKCE: Atacante necesita el code_verifier');
      console.log('   - Code Verifier nunca se envía hasta este paso');
      console.log('   - Code Challenge valida que tenemos el verifier correcto');

    } catch (error) {
      console.error('❌ Error en el flujo PKCE:');
      if (error.response) {
        console.error('   - Status:', error.response.status);
        console.error('   - Data:', error.response.data);
      } else {
        console.error('   - Message:', error.message);
      }
    }
  }

  static async demonstratePKCESecurity() {
    console.log();
    console.log('🔬 DEMOSTRACIÓN: Validación PKCE');
    console.log('-'.repeat(40));

    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = this.generateCodeChallenge(codeVerifier);

    console.log('Code Verifier generado:', codeVerifier);
    console.log('Code Challenge calculado:', codeChallenge);
    
    // Demostrar validación
    const isValid = this.generateCodeChallenge(codeVerifier) === codeChallenge;
    console.log('Validación exitosa?:', isValid);
    
    // Demostrar que verifier incorrecto falla
    const wrongVerifier = this.generateCodeVerifier();
    const wouldFail = this.generateCodeChallenge(wrongVerifier) === codeChallenge;
    console.log('Verifier incorrecto pasaría?:', wouldFail);
  }
}

// Ejecutar demo
async function main() {
  console.log('📱 OAuth 2.0 Mobile Client - PKCE Demo');
  console.log('ℹ️  Client: mobile-client-456 (público)');
  console.log('ℹ️  Scope: profile openid');
  console.log('ℹ️  PKCE: Habilitado (S256)');
  console.log();

  await PKCEDemo.runPKCEFlow();
  await PKCEDemo.demonstratePKCESecurity();

  console.log();
  console.log('🎉 Demo PKCE completado!');
  console.log('💡 En una app móvil real:');
  console.log('   - Code verifier se guarda localmente');
  console.log('   - El navegador/webview maneja la redirección');
  console.log('   - La app captura el código de la URL');
  console.log('   - Se intercambia código + verifier por token');
}

main().catch(console.error);