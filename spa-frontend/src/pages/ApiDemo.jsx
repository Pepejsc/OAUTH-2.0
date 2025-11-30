import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const ApiDemo = () => {
  const { token } = useAuth()
  const [apiResults, setApiResults] = useState({})
  const [loading, setLoading] = useState({})
  const [useMachineToken, setUseMachineToken] = useState(false)

  // Token de machine client para demostración
  const machineToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOiJtYWNoaW5lLWNsaWVudC03ODkiLCJzY29wZSI6WyJhcGk6cmVhZCIsImFwaTp3cml0ZSJdLCJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZ3JhbnRfdHlwZSI6ImNsaWVudF9jcmVkZW50aWFscyIsImlhdCI6MTc2NDQ3MTg1OSwiZXhwIjoxNzY0NDc1NDU5fQ.6hxQ8gJY4X6w6Q6tQ7Q8w9Q0w1Q2w3Q4w5Q6w7Q8w9Q0'

  const getCurrentToken = () => {
    return useMachineToken ? machineToken : token
  }

  const testEndpoint = async (endpoint, name) => {
    setLoading(prev => ({ ...prev, [name]: true }))
    
    try {
      const currentToken = getCurrentToken()
      const response = await axios.get(`http://localhost:3002${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      })
      setApiResults(prev => ({
        ...prev,
        [name]: { 
          success: true, 
          data: response.data,
          tokenType: useMachineToken ? 'machine' : 'user'
        }
      }))
    } catch (error) {
      setApiResults(prev => ({
        ...prev,
        [name]: { 
          success: false, 
          error: error.response?.data?.error_description || error.message,
          tokenType: useMachineToken ? 'machine' : 'user'
        }
      }))
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }))
    }
  }

  const endpoints = [
    { 
      name: 'Perfil de Usuario', 
      endpoint: '/api/profile', 
      description: 'Obtiene información del perfil del usuario',
      scope: 'profile',
      expected: 'user'
    },
    { 
      name: 'Información de Email', 
      endpoint: '/api/email', 
      description: 'Obtiene información del email del usuario',
      scope: 'email',
      expected: 'user'
    },
    { 
      name: 'Status del Sistema', 
      endpoint: '/api/system/status', 
      description: 'Obtiene el estado del sistema',
      scope: 'api:read',
      expected: 'machine'
    },
    { 
      name: 'Métricas del Sistema', 
      endpoint: '/api/system/metrics', 
      description: 'Obtiene métricas del sistema',
      scope: 'api:read',
      expected: 'machine'
    }
  ]

  return (
    <div className="api-demo-page">
      <div className="card">
        <h1>🔧 Demo de APIs - Comparación de Scopes</h1>
        <p>Prueba cómo diferentes tokens con diferentes scopes acceden a APIs</p>

        <div className="token-selector">
          <h3>Seleccionar Tipo de Token:</h3>
          <div className="toggle-buttons">
            <button
              onClick={() => setUseMachineToken(false)}
              className={`btn ${!useMachineToken ? 'active' : 'btn-secondary'}`}
            >
              👤 Token de Usuario
            </button>
            <button
              onClick={() => setUseMachineToken(true)}
              className={`btn ${useMachineToken ? 'active' : 'btn-secondary'}`}
            >
              🤖 Token de Máquina
            </button>
          </div>
          
          <div className="token-info">
            <h4>Token Actual:</h4>
            <code className="token-display">
              {getCurrentToken() ? `${getCurrentToken().substring(0, 30)}...` : 'No disponible'}
            </code>
            <div className="scope-info">
              <strong>Scopes:</strong>{' '}
              {useMachineToken ? 'api:read, api:write' : 'profile, email'}
            </div>
          </div>
        </div>

        <div className="endpoints-grid">
          {endpoints.map((ep) => (
            <div key={ep.name} className="endpoint-card">
              <h4>{ep.name}</h4>
              <p>{ep.description}</p>
              <div className="endpoint-meta">
                <span className={`scope-badge ${ep.expected}`}>
                  Scope: {ep.scope}
                </span>
                <span className={`expected-badge ${ep.expected}`}>
                  Esperado: {ep.expected}
                </span>
                <code className="endpoint-path">{ep.endpoint}</code>
              </div>
              
              <button
                onClick={() => testEndpoint(ep.endpoint, ep.name)}
                disabled={loading[ep.name]}
                className="btn"
                style={{ marginTop: '1rem' }}
              >
                {loading[ep.name] ? '⏳ Probando...' : '🚀 Probar Endpoint'}
              </button>

              {apiResults[ep.name] && (
                <div className={`result ${apiResults[ep.name].success ? 'success' : 'error'}`}>
                  <h5>
                    {apiResults[ep.name].success ? '✅ Éxito' : '❌ Error'} 
                    <span className="token-type">({apiResults[ep.name].tokenType} token)</span>
                  </h5>
                  <pre>
                    {JSON.stringify(
                      apiResults[ep.name].success 
                        ? apiResults[ep.name].data 
                        : apiResults[ep.name].error,
                      null, 2
                    )}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="demo-explanation">
          <h3>🎯 Explicación de la Demostración</h3>
          <div className="explanation-grid">
            <div className="explanation-item">
              <h4>👤 Token de Usuario</h4>
              <p>• Scopes: <code>profile email</code></p>
              <p>• ✅ Accede a datos personales</p>
              <p>• ❌ No accede a APIs de sistema</p>
            </div>
            <div className="explanation-item">
              <h4>🤖 Token de Máquina</h4>
              <p>• Scopes: <code>api:read api:write</code></p>
              <p>• ✅ Accede a APIs de sistema</p>
              <p>• ❌ No accede a datos personales</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApiDemo