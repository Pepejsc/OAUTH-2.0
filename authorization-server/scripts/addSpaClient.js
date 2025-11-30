const mongoose = require('mongoose');
const Client = require('../models/Client');
require('dotenv').config();

async function addSpaRedirectUri() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Agregar redirect_uri del SPA al web client
    await Client.updateOne(
      { clientId: 'web-client-123' },
      { 
        $addToSet: { 
          redirectUris: 'http://localhost:3003/callback'
        }
      }
    );

    console.log('✅ Redirect URI del SPA agregado a web-client-123');
    console.log('   - Nuevo redirect_uri: http://localhost:3003/callback');
    
    // Verificar los redirect URIs actuales
    const client = await Client.findOne({ clientId: 'web-client-123' });
    console.log('   - Redirect URIs actuales:', client.redirectUris);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addSpaRedirectUri();