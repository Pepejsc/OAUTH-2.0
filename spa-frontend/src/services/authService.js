import axios from 'axios'

const API_BASE = 'http://localhost:3002'
const AUTH_BASE = 'http://localhost:3001'

export const authService = {
  // Iniciar flujo OAuth
  startOAuthFlow() {
    const state = Math.random().toString(36).substring(7)
    const authUrl = `${AUTH_BASE}/oauth/authorize?` +
      `client_id=web-client-123&` +
      `redirect_uri=http://localhost:3003/callback&` +
      `response_type=code&` +
      `scope=profile%20email&` +
      `state=${state}`
    
    localStorage.setItem('oauth_state', state)
    window.location.href = authUrl
  },

  // Intercambiar código por token
  async exchangeCodeForToken(code) {
    try {
      const response = await axios.post(`${AUTH_BASE}/oauth/token`, 
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: 'http://localhost:3003/callback',
          client_id: 'web-client-123',
          client_secret: 'web-secret-456'
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error_description || 'Error obteniendo token')
    }
  },

  // Obtener perfil de usuario
  async getUserProfile(accessToken) {
    try {
      const response = await axios.get(`${API_BASE}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      return response.data
    } catch (error) {
      throw new Error('Error obteniendo perfil de usuario')
    }
  },

  // Obtener email del usuario
  async getUserEmail(accessToken) {
    try {
      const response = await axios.get(`${API_BASE}/api/email`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      return response.data
    } catch (error) {
      throw new Error('Error obteniendo email')
    }
  }
}

// Interceptor para auto-incluir token en requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('oauth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores de autenticación
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('oauth_token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)