const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/oauth_demo')
.then(() => console.log('✅ Resource Server - MongoDB conectado'))
.catch(err => console.log('❌ Resource Server - Error MongoDB:', err.message));

// Middleware de autenticación JWT mejorado
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'access_denied', error_description: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ error: 'invalid_token', error_description: 'Token is invalid or expired' });
    }

    // Manejar diferentes tipos de tokens
    if (payload.grant_type === 'client_credentials') {
      // Token de máquina - no tiene usuario
      req.client = {
        client_id: payload.client_id,
        scope: payload.scope,
        grant_type: payload.grant_type
      };
      console.log('🤖 Acceso de máquina:', payload.client_id);
    } else {
      // Token de usuario normal
      req.user = payload;
      console.log('👤 Acceso de usuario:', payload.sub);
    }

    next();
  });
};

// Middleware para verificar scopes mejorado
const requireScope = (scope) => {
  return (req, res, next) => {
    const entity = req.user || req.client;
    
    if (!entity || !entity.scope || !entity.scope.includes(scope)) {
      return res.status(403).json({ 
        error: 'insufficient_scope', 
        error_description: `Scope '${scope}' required` 
      });
    }
    next();
  };
};

// Rutas públicas
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Resource Server' });
});

// Rutas protegidas para usuarios
app.get('/api/profile', authenticateToken, requireScope('profile'), (req, res) => {
  res.json({
    user: {
      id: req.user.sub,
      client_id: req.user.client_id,
      profile: {
        name: 'Demo User',
        email: 'demo@example.com',
        avatar: 'https://via.placeholder.com/150'
      }
    },
    accessed_at: new Date().toISOString()
  });
});

app.get('/api/email', authenticateToken, requireScope('email'), (req, res) => {
  res.json({
    email: 'demo@example.com',
    verified: true,
    primary: true
  });
});

// Rutas protegidas para máquinas (Client Credentials)
app.get('/api/system/status', authenticateToken, requireScope('api:read'), (req, res) => {
  res.json({
    service: 'Resource Server',
    status: 'operational',
    timestamp: new Date().toISOString(),
    accessed_by: req.client ? req.client.client_id : req.user.sub,
    client_type: req.client ? 'machine' : 'user'
  });
});

app.get('/api/system/metrics', authenticateToken, requireScope('api:read'), (req, res) => {
  res.json({
    metrics: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    },
    accessed_by: req.client.client_id
  });
});

app.post('/api/system/cleanup', authenticateToken, requireScope('api:write'), (req, res) => {
  res.json({
    task: 'cleanup',
    status: 'completed',
    timestamp: new Date().toISOString(),
    executed_by: req.client.client_id
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Resource Server running on port ${PORT}`);
});