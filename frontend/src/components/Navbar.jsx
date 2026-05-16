import React from 'react'
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <BootstrapNavbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="fw-bold">
          AI Resume Analyzer
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle />
        <BootstrapNavbar.Collapse>
          {user ? (
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/upload" className="fw-bold text-warning">
                Upload Resume
              </Nav.Link>
              <Nav.Link as={Link} to="/jobs">Jobs</Nav.Link>
              <Nav.Link as={Link} to="/matches">Matches</Nav.Link>
              <Nav.Link className="text-light">Welcome, {user.username}</Nav.Link>
              <Button variant="outline-light" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </Nav>
          ) : (
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
              <Nav.Link as={Link} to="/register">Register</Nav.Link>
            </Nav>
          )}
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  )
}

export default Navbar