# 🚀 Guía de Implementación OAuth 2.0

## 📋 Descripción del Proyecto
Implementación completa de OAuth 2.0 con todos los flujos principales:
- Authorization Code
- PKCE (Proof Key for Code Exchange)
- Client Credentials

## 🏗️ Arquitectura

### Servicios
1. **Authorization Server** (3001) - Servidor de autorización
2. **Resource Server** (3002) - API protegida con recursos
3. **Web Client** (3000) - Cliente web (Authorization Code)
4. **Mobile Client** - Cliente móvil (PKCE)
5. **Machine Client** - Cliente máquina (Client Credentials)

### Flujos Implementados

#### 🔐 Authorization Code Flow

Usuario → Web Client → Auth Server → Resource Server
#### 🔐🔐 PKCE Flow  

App Móvil → Auth Server (con PKCE) → Resource Server
#### 🤖 Client Credentials Flow

Servicio → Auth Server → Resource Server
## 🚀 Inicio Rápido


### 1. Instalación
npm run install:all