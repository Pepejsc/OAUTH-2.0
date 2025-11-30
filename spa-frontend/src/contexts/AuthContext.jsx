import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('oauth_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar token al cargar la app
    if (token) {
      verifyToken()
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async () => {
    try {
      const userData = await authService.getUserProfile(token)
      setUser(userData)
    } catch (error) {
      console.error('Token inválido:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = (newToken, userData) => {
    setToken(newToken)
    setUser(userData)
    localStorage.setItem('oauth_token', newToken)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('oauth_token')
  }

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!token && !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}