const mongoose = require('mongoose');
const Client = require('../models/Client');
require('dotenv').config();

async function initData() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/oauth_demo');
    console.log('✅ Conectado a MongoDB para inicializar datos');

    // Limpiar datos existentes
    await Client.deleteMany({});
    console.log('🧹 Datos anteriores limpiados');

    // Crear clientes de prueba
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
      }
    ];

    // Insertar clientes
    await Client.insertMany(clients);
    console.log('📝 Clientes de prueba creados:');
    clients.forEach(client => {
      console.log(`   - ${client.clientName} (${client.clientId})`);
    });

    console.log('🎉 Datos de inicialización completados');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error inicializando datos:', error);
    process.exit(1);
  }
}

initData();