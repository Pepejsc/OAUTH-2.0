const axios = require('axios');

// Configuración
const config = {
  authServerUrl: 'http://localhost:3001',
  clientId: 'machine-client-789',
  clientSecret: 'machine-secret-999',
  scope: 'api:read api:write'
};

class MachineClientDemo {
  static async runClientCredentialsFlow() {
    console.log('🤖 INICIANDO DEMO CLIENT CREDENTIALS (Machine-to-Machine)');
    console.log('='.repeat(60));

    try {
      // Paso 1: Obtener token directamente con client credentials
      console.log('🔑 Paso 1: Obtener token con Client Credentials...');
      console.log('   - URL:', `${config.authServerUrl}/oauth/token`);
      console.log('   - Client ID:', config.clientId);
      console.log('   - Scope:', config.scope);
      
      const tokenResponse = await axios.post(
        `${config.authServerUrl}/oauth/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: config.clientId,
          client_secret: config.clientSecret,
          scope: config.scope
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 5000
        }
      );

      console.log('✅ Token obtenido exitosamente!');
      console.log('   - Status:', tokenResponse.status);
      console.log('   - Access Token:', tokenResponse.data.access_token);
      console.log('   - Token Type:', tokenResponse.data.token_type);
      console.log('   - Expires In:', tokenResponse.data.expires_in, 'segundos');
      console.log('   - Scope:', tokenResponse.data.scope);
      console.log();

      // Paso 2: Usar el token para acceder a APIs de servicio
      console.log('📡 Paso 2: Acceder a APIs de sistema...');
      
      // Probar endpoint de status
      const statusResponse = await axios.get(
        'http://localhost:3002/api/system/status',
        {
          headers: {
            'Authorization': `${tokenResponse.data.token_type} ${tokenResponse.data.access_token}`
          }
        }
      );
      console.log('✅ Status API accedida exitosamente!');
      console.log('   - Status:', statusResponse.status);
      console.log('   - Datos:', JSON.stringify(statusResponse.data, null, 2));
      console.log();

    } catch (error) {
      console.error('❌ Error en el flujo Client Credentials:');
      console.error('   - Error completo:', error);
      
      if (error.response) {
        // El servidor respondió con un código de error
        console.error('   - Status:', error.response.status);
        console.error('   - Status Text:', error.response.statusText);
        console.error('   - Headers:', error.response.headers);
        console.error('   - Data:', error.response.data);
        console.error('   - URL:', error.response.config?.url);
      } else if (error.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        console.error('   - No se recibió respuesta del servidor');
        console.error('   - Request:', error.request);
      } else {
        // Algo pasó al configurar la solicitud
        console.error('   - Error Message:', error.message);
        console.error('   - Stack:', error.stack);
      }
      console.error('   - Config:', error.config);
    }
  }
}

// Ejecutar demo
async function main() {
  console.log('🤖 OAuth 2.0 Machine Client - Client Credentials Demo');
  console.log('ℹ️  Client: machine-client-789 (confidencial)');
  console.log('ℹ️  Scope: api:read api:write');
  console.log('ℹ️  Grant Type: client_credentials');
  console.log();

  await MachineClientDemo.runClientCredentialsFlow();
}

main().catch(console.error);