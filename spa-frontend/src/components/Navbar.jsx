import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()

  const handleLogout = () => {
    logout()
  }

  return (
    <nav className="navbar">
      <div className="nav-content">
        <div className="nav-logo">
          🔐 OAuth 2.0 SPA
        </div>
        
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Inicio
          </Link>

          {isAuthenticated ? (
            <>
              <Link 
                to="/profile" 
                className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
              >
                Mi Perfil
              </Link>
              
              <Link 
                to="/demo" 
                className={`nav-link ${location.pathname === '/demo' ? 'active' : ''}`}
              >
                Demo API
              </Link>
              
              <div className="user-info">
                <span style={{ color: 'white', marginRight: '1rem' }}>
                  👋 {user?.user?.profile?.name}
                </span>
                <button onClick={handleLogout} className="btn btn-secondary">
                  Cerrar Sesión
                </button>
              </div>
            </>
          ) : (
            <Link to="/" className="btn">
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar