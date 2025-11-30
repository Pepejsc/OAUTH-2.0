import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { authService } from '../services/authService'

const Home = () => {
  const { isAuthenticated, user } = useAuth()

  const handleLogin = () => {
    authService.startOAuthFlow()
  }

  return (
    <div className="home-page">
      <div className="card">
        <h1>🚀 OAuth 2.0 SPA Demo</h1>
        <p className="subtitle">
          Implementación moderna con React y manejo de tokens en cliente
        </p>

        {!isAuthenticated ? (
          <div className="auth-section">
            <button onClick={handleLogin} className="btn" style={{ fontSize: '1.2rem', padding: '15px 30px' }}>
              🔐 Iniciar Sesión con OAuth 2.0
            </button>
            
            <div className="features-grid">
              <div className="feature-card">
                <h3>🛡️ Single Page Application</h3>
                <p>Navegación client-side sin recargas</p>
              </div>
              
              <div className="feature-card">
                <h3>🔐 Token Management</h3>
                <p>Manejo automático de tokens JWT</p>
              </div>
              
              <div className="feature-card">
                <h3>⚡ Context API</h3>
                <p>Estado global para autenticación</p>
              </div>
              
              <div className="feature-card">
                <h3>🎨 Modern UI</h3>
                <p>Interfaz responsive y moderna</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="welcome-section">
            <h2>🎉 ¡Bienvenido de vuelta!</h2>
            <div className="user-card">
              <h3>👤 {user?.user?.profile?.name}</h3>
              <p>📧 {user?.user?.profile?.email}</p>
              <p>🆔 User ID: {user?.user?.id}</p>
              <p>🔧 Client: {user?.user?.client_id}</p>
            </div>
            
            <div className="action-buttons">
              <a href="/profile" className="btn">
                Ver Perfil Completo
              </a>
              <a href="/demo" className="btn btn-secondary">
                Probar APIs
              </a>
            </div>
          </div>
        )}

        <div className="tech-stack">
          <h3>🛠️ Stack Tecnológico</h3>
          <div className="tech-items">
            <span className="tech-item">React 18</span>
            <span className="tech-item">React Router</span>
            <span className="tech-item">Context API</span>
            <span className="tech-item">Axios</span>
            <span className="tech-item">Vite</span>
            <span className="tech-item">OAuth 2.0</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home