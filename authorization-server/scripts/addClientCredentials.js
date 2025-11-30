const mongoose = require('mongoose');
const Client = require('../models/Client');
require('dotenv').config();

async function addClientCredentialsSupport() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Agregar grants a clientes existentes
    await Client.updateOne(
      { clientId: 'machine-client-789' },
      { 
        $addToSet: { 
          grants: 'client_credentials'
        },
        scopes: ['api:read', 'api:write']
      }
    );

    console.log('✅ Client Credentials agregado a machine-client-789');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addClientCredentialsSupport();