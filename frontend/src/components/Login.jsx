import React, { useState } from 'react'
import { Card, Form, Button, Alert } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(username, password)
    
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <Card className="shadow">
          <Card.Header as="h4" className="text-center bg-primary text-white">
            Login
          </Card.Header>
          <Card.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit" disabled={loading} className="w-100">
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </Form>
            <div className="mt-3 text-center">
              <Link to="/register">Don't have an account? Register here</Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}

export default Login