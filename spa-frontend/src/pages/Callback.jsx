import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authService } from '../services/authService'

const Callback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        const state = searchParams.get('state')

        if (error) {
          throw new Error(`Error de autorización: ${error}`)
        }

        if (!code) {
          throw new Error('No se recibió código de autorización')
        }

        // Validar state (CSRF protection)
        const savedState = localStorage.getItem('oauth_state')
        if (state !== savedState) {
          throw new Error('Invalid state parameter')
        }

        // Intercambiar código por token
        const tokenData = await authService.exchangeCodeForToken(code)
        
        // Obtener perfil de usuario
        const userProfile = await authService.getUserProfile(tokenData.access_token)

        // Guardar en estado global
        login(tokenData.access_token, userProfile)

        // Limpiar y redirigir
        localStorage.removeItem('oauth_state')
        navigate('/profile')

      } catch (err) {
        console.error('Error en callback:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    handleCallback()
  }, [searchParams, navigate, login])

  if (loading) {
    return (
      <div className="card">
        <div className="loading-state">
          <div className="spinner"></div>
          <h3>Procesando autenticación...</h3>
          <p>Estamos intercambiando tu código por un token de acceso</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="error-state">
          <h3 style={{ color: '#ff6b6b' }}>❌ Error de Autenticación</h3>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/')} 
            className="btn"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default Callback