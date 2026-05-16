import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import ResumeUpload from './components/ResumeUpload'
import JobList from './components/JobList'
import Matches from './components/Matches'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('access_token')
  return token ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container mt-4" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <PrivateRoute><Dashboard /></PrivateRoute>
            } />
            <Route path="/upload" element={
              <PrivateRoute><ResumeUpload /></PrivateRoute>
            } />
            <Route path="/jobs" element={
              <PrivateRoute><JobList /></PrivateRoute>
            } />
            <Route path="/matches" element={
              <PrivateRoute><Matches /></PrivateRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App