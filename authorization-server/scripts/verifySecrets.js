const mongoose = require('mongoose');
const Client = require('../models/Client');
require('dotenv').config();

async function verifySecrets() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const clients = await Client.find({});
    console.log('🔐 Secrets de clientes:');
    
    clients.forEach(client => {
      console.log(`\n🔸 ${client.clientName} (${client.clientId})`);
      console.log(`   - Client Secret: ${client.clientSecret}`);
      console.log(`   - Tipo: ${client.clientType}`);
      console.log(`   - Grants: ${client.grants.join(', ')}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifySecrets();