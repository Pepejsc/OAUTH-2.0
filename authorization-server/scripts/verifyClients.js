const mongoose = require('mongoose');
const Client = require('../models/Client');
require('dotenv').config();

async function verifyClients() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const clients = await Client.find({});
    console.log('📋 Clientes en la base de datos:');
    
    clients.forEach(client => {
      console.log(`\n🔸 ${client.clientName} (${client.clientId})`);
      console.log(`   - Tipo: ${client.clientType}`);
      console.log(`   - Grants: ${client.grants.join(', ')}`);
      console.log(`   - Scopes: ${client.scopes.join(', ')}`);
      console.log(`   - Redirect URIs: ${client.redirectUris.join(', ')}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyClients();