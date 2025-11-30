import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Profile from './pages/Profile'
import Callback from './pages/Callback'
import ApiDemo from './pages/ApiDemo'
import LoadingSpinner from './components/LoadingSpinner'
import './App.css'

function App() {
  const { loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/demo" element={<ApiDemo />} />
        </Routes>
      </main>
    </div>
  )
}

export default App