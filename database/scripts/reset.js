const mongoose = require('mongoose');
const Client = require('../../authorization-server/models/Client');
const AuthorizationCode = require('../../authorization-server/models/AuthorizationCode');
require('dotenv').config();

async function resetDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar todas las colecciones
    await Client.deleteMany({});
    await AuthorizationCode.deleteMany({});
    
    console.log('✅ Base de datos limpiada');
    console.log('💡 Ejecuta node scripts/initData.js para recrear datos de prueba');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetDatabase();