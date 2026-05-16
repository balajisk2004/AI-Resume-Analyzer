import React, { useState } from 'react'
import { Card, Form, Button, Alert } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  })
  const [error, setError] = useState({})
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError({})
    setLoading(true)

    const result = await register(formData)
    
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error || { general: 'Registration failed' })
    }
    setLoading(false)
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <Card className="shadow">
          <Card.Header as="h4" className="text-center bg-primary text-white">
            Register
          </Card.Header>
          <Card.Body>
            {error.general && <Alert variant="danger">{error.general}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Username *</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
                {error.username && <small className="text-danger">{error.username}</small>}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password * (min 6 characters)</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit" disabled={loading} className="w-100">
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </Form>
            <div className="mt-3 text-center">
              <Link to="/login">Already have an account? Login here</Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}

export default Register