const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ◀️ IMPORTANTE para POST

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/oauth_demo')
.then(() => console.log('✅ MongoDB conectado exitosamente'))
.catch(err => console.log('❌ Error MongoDB:', err.message));

// ▶️▶️▶️ ESTAS LÍNEAS SON CRÍTICAS - DEBEN ESTAR AQUÍ ▶️▶️▶️
const authRoutes = require('./routes/auth');
const tokenRoutes = require('./routes/token');

app.use('/oauth', authRoutes);
app.use('/oauth', tokenRoutes);
// ◀️◀️◀️ HASTA AQUÍ ◀️◀️◀️

// Rutas básicas
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Authorization Server' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Authorization Server running on port ${PORT}`);
});