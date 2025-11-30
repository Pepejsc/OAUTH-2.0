import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { authService } from '../services/authService'

const Profile = () => {
  const { user, token } = useAuth()
  const [emailData, setEmailData] = useState(null)
  const [loadingEmail, setLoadingEmail] = useState(false)

  const loadEmailData = async () => {
    if (!token) return
    
    setLoadingEmail(true)
    try {
      const emailInfo = await authService.getUserEmail(token)
      setEmailData(emailInfo)
    } catch (error) {
      console.error('Error cargando email:', error)
    } finally {
      setLoadingEmail(false)
    }
  }

  useEffect(() => {
    loadEmailData()
  }, [token])

  if (!user) {
    return (
      <div className="card">
        <h3>No hay información de usuario</h3>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="card">
        <h1>👤 Perfil de Usuario</h1>
        
        <div className="profile-grid">
          <div className="profile-section">
            <h3>Información Básica</h3>
            <div className="info-item">
              <strong>Nombre:</strong> {user.user.profile.name}
            </div>
            <div className="info-item">
              <strong>Email:</strong> {user.user.profile.email}
            </div>
            <div className="info-item">
              <strong>User ID:</strong> {user.user.id}
            </div>
            <div className="info-item">
              <strong>Client ID:</strong> {user.user.client_id}
            </div>
            <div className="info-item">
              <strong>Último acceso:</strong> {new Date(user.accessed_at).toLocaleString()}
            </div>
          </div>

          <div className="profile-section">
            <h3>Información de Email</h3>
            {loadingEmail ? (
              <div className="loading">Cargando...</div>
            ) : emailData ? (
              <>
                <div className="info-item">
                  <strong>Email:</strong> {emailData.email}
                </div>
                <div className="info-item">
                  <strong>Verificado:</strong> {emailData.verified ? '✅ Sí' : '❌ No'}
                </div>
                <div className="info-item">
                  <strong>Principal:</strong> {emailData.primary ? '✅ Sí' : '❌ No'}
                </div>
              </>
            ) : (
              <div className="error">No se pudo cargar la información del email</div>
            )}
          </div>
        </div>

        <div className="profile-section">
          <h3>Token Information</h3>
          <div className="token-preview">
            <strong>Access Token:</strong>
            <code className="token-code">
              {token ? `${token.substring(0, 50)}...` : 'No disponible'}
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile