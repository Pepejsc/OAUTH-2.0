const mongoose = require('mongoose');
const Client = require('../models/Client');
const AuthorizationCode = require('../models/AuthorizationCode');
require('dotenv').config();

async function resetDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar todas las colecciones
    await Client.deleteMany({});
    await AuthorizationCode.deleteMany({});
    
    console.log('✅ Base de datos limpiada');
    
    // Recrear datos básicos
    console.log('🔄 Recreando datos de prueba...');
    
    const clients = [
      {
        clientId: 'web-client-123',
        clientSecret: 'web-secret-456',
        clientName: 'Web Application Demo',
        clientType: 'confidential',
        redirectUris: ['http://localhost:3000/callback'],
        grants: ['authorization_code', 'refresh_token'],
        scopes: ['profile', 'email']
      },
      {
        clientId: 'mobile-client-456',
        clientName: 'Mobile App Demo',
        clientType: 'public',
        redirectUris: ['com.oauth.demo://callback'],
        grants: ['authorization_code'],
        scopes: ['profile', 'openid']
      },
      {
        clientId: 'test',
        clientSecret: 'test-secret',
        clientName: 'Test Client',
        clientType: 'confidential',
        redirectUris: ['http://localhost:3000/callback'],
        grants: ['authorization_code'],
        scopes: ['profile']
      },
      {
        clientId: 'machine-client-789',
        clientSecret: 'machine-secret-999',
        clientName: 'Machine-to-Machine Service',
        clientType: 'confidential',
        redirectUris: [],
        grants: ['client_credentials'],
        scopes: ['api:read', 'api:write']
      }
    ];

    await Client.insertMany(clients);
    console.log('✅ Clientes recreados:');
    clients.forEach(client => {
      console.log(`   - ${client.clientName} (${client.clientId})`);
    });

    console.log('\n🎉 Base de datos resetada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetDatabase();