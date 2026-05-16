import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/register/', userData)
      if (response.data.success) {
        localStorage.setItem('access_token', response.data.access)
        localStorage.setItem('refresh_token', response.data.refresh)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        setUser(response.data.user)
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`
        return { success: true, message: response.data.message }
      }
      return { success: false, error: response.data.errors }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.errors || error.response?.data?.error || 'Registration failed' 
      }
    }
  }

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/login/', { username, password })
      if (response.data.success) {
        localStorage.setItem('access_token', response.data.access)
        localStorage.setItem('refresh_token', response.data.refresh)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        setUser(response.data.user)
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`
        return { success: true, message: response.data.message }
      }
      return { success: false, error: response.data.error }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed. Please check your credentials.' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}