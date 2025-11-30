const mongoose = require('mongoose');
const Client = require('../models/Client');
require('dotenv').config();

async function addMachineClient() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Crear cliente machine-to-machine
    const machineClient = new Client({
      clientId: 'machine-client-789',
      clientSecret: 'machine-secret-999',
      clientName: 'Machine-to-Machine Service',
      clientType: 'confidential',
      redirectUris: [], // No necesita redirect URIs
      grants: ['client_credentials'],
      scopes: ['api:read', 'api:write']
    });

    await machineClient.save();
    console.log('✅ Machine Client creado: machine-client-789');
    console.log('   - Grants: client_credentials');
    console.log('   - Scopes: api:read, api:write');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addMachineClient();