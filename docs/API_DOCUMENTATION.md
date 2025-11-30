# 📚 Documentación de API - OAuth 2.0 Demo

## 🌐 Servicios en Ejecución

| Servicio | Puerto | URL | Descripción |
|----------|--------|-----|-------------|
| **Web Client** | 3000 | http://localhost:3000 | Cliente web demostrativo |
| **Authorization Server** | 3001 | http://localhost:3001 | Servidor de autorización OAuth |
| **Resource Server** | 3002 | http://localhost:3002 | API protegida con recursos |

## 🔐 Authorization Server (Puerto 3001)

### Endpoints Públicos
- `GET /health` - Health check del servicio

### Endpoints OAuth 2.0

#### `GET /oauth/authorize`
Inicia el flujo de autorización OAuth.

**Parámetros Query:**
- `client_id` (requerido) - Identificador del cliente
- `redirect_uri` (requerido) - URI de redirección autorizada
- `response_type` (requerido) - Debe ser `code`
- `scope` (opcional) - Scopes solicitados (separados por espacio)
- `state` (recomendado) - Parámetro anti-CSRF
- `code_challenge` (PKCE) - Challenge para PKCE
- `code_challenge_method` (PKCE) - `S256` o `plain`

