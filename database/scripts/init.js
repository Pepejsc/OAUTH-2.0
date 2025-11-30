const mongoose = require('mongoose');
require('dotenv').config();

async function initDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/oauth_demo');
    console.log('✅ Base de datos OAuth inicializada');
    
    // Crear índices para mejor performance
    const db = mongoose.connection.db;
    
    // Índice para AuthorizationCodes (expiración)
    await db.collection('authorizationcodes').createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });
    
    // Índice para búsqueda rápida de clients
    await db.collection('clients').createIndex({ "clientId": 1 }, { unique: true });
    
    console.log('✅ Índices de base de datos creados');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    process.exit(1);
  }
}

initDatabase();