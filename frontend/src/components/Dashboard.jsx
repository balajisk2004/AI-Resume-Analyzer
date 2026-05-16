import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Spinner, Alert, Button, Modal, Table, Badge } from 'react-bootstrap'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_resumes: 0,
    average_match_score: 0,
    average_ats_score: 0,
    latest_matches: [],
    latest_resume: null
  })
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [resumeToDelete, setResumeToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardStats()
    fetchResumes()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('access_token')
      console.log('Fetching dashboard stats...')
      
      const response = await axios.get('http://localhost:8000/api/dashboard/stats/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('Dashboard response:', response.data)
      setStats(response.data)
    } catch (error) {
      console.error('Dashboard error:', error)
      setError('Failed to load dashboard data. Please make sure the backend is running.')
    }
  }

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get('http://localhost:8000/api/resumes/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setResumes(response.data)
    } catch (error) {
      console.error('Error fetching resumes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (resume) => {
    setResumeToDelete(resume)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!resumeToDelete) return
    
    setDeleting(true)
    try {
      const token = localStorage.getItem('access_token')
      await axios.delete(`http://localhost:8000/api/resumes/${resumeToDelete.id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Refresh data
      await fetchResumes()
      await fetchDashboardStats()
      
      setShowDeleteModal(false)
      setResumeToDelete(null)
      
      // Show success message (you can add a toast notification here)
      alert('Resume deleted successfully!')
    } catch (error) {
      console.error('Error deleting resume:', error)
      alert('Failed to delete resume. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return (
    <div className="text-center mt-5">
      <Spinner animation="border" variant="primary" />
      <p className="mt-2">Loading dashboard...</p>
    </div>
  )
  
  if (error) return <Alert variant="danger">{error}</Alert>

  return (
    <div>
      <h2 className="mb-4 text-primary">Dashboard</h2>
      
      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center bg-info text-white shadow">
            <Card.Body>
              <h1 className="display-4">{stats.total_resumes || 0}</h1>
              <Card.Text>Resumes Uploaded</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center bg-success text-white shadow">
            <Card.Body>
              <h1 className="display-4">{stats.average_match_score || 0}%</h1>
              <Card.Text>Average Match Score</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center bg-warning text-white shadow">
            <Card.Body>
              <h1 className="display-4">{stats.average_ats_score || 0}%</h1>
              <Card.Text>Average ATS Score</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Resumes List Section */}
      {resumes.length > 0 && (
        <Card className="mb-4 shadow">
          <Card.Header as="h5" className="bg-secondary text-white">
            📋 Your Resumes
          </Card.Header>
          <Card.Body>
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Upload Date</th>
                  <th>ATS Score</th>
                  <th>Skills</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {resumes.map((resume) => (
                  <tr key={resume.id}>
                    <td>{new Date(resume.uploaded_at).toLocaleDateString()}</td>
                    <td>
                      <Badge bg={resume.ats_score >= 70 ? 'success' : resume.ats_score >= 50 ? 'warning' : 'danger'}>
                        {resume.ats_score || 0}%
                      </Badge>
                    </td>
                    <td>
                      {resume.skills && resume.skills.split(',').slice(0, 3).map((skill, idx) => (
                        <Badge key={idx} bg="info" className="me-1">{skill.trim()}</Badge>
                      ))}
                      {resume.skills && resume.skills.split(',').length > 3 && (
                        <Badge bg="secondary">+{resume.skills.split(',').length - 3}</Badge>
                      )}
                    </td>
                    <td>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleDeleteClick(resume)}
                      >
                         Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Top Matches Section */}
      <h3 className="mb-3"> Top Job Matches</h3>
      {stats.latest_matches && stats.latest_matches.length > 0 ? (
        <Row>
          {stats.latest_matches.map((match, idx) => (
            <Col md={6} lg={4} key={idx} className="mb-4">
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <Card.Title className="text-primary">{match.job_title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {match.company} • {match.location}
                  </Card.Subtitle>
                  
                  <div className="mb-3">
                    <strong>Match Score:</strong>
                    <div className="progress mt-1" style={{ height: '25px' }}>
                      <div 
                        className={`progress-bar ${match.match_score >= 70 ? 'bg-success' : match.match_score >= 50 ? 'bg-warning' : 'bg-danger'}`}
                        style={{ width: `${match.match_score}%` }}
                      >
                        {match.match_score}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <strong>ATS Score:</strong>
                    <div className="progress mt-1" style={{ height: '25px' }}>
                      <div 
                        className="progress-bar bg-info"
                        style={{ width: `${match.ats_score}%` }}
                      >
                        {match.ats_score}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <strong className="text-success">✓ Matched Skills:</strong>
                    <p className="small mb-0 text-muted">
                      {match.matched_skills !== 'None' ? match.matched_skills.substring(0, 80) : 'No skills matched'}
                    </p>
                  </div>
                  
                  <div className="mb-2">
                    <strong className="text-danger">✗ Missing Skills:</strong>
                    <p className="small mb-0 text-muted">
                      {match.missing_skills !== 'None' ? match.missing_skills.substring(0, 80) : 'All skills matched!'}
                    </p>
                  </div>
                  
                  {match.recommendations && match.recommendations !== '✅ Your resume looks well-matched for this role!' && (
                    <div className="mt-2 p-2 bg-light rounded">
                      <strong className="text-info"> Recommendation:</strong>
                      <p className="small mb-0">{match.recommendations}</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Alert variant="info">
          <Alert.Heading>No matches yet!</Alert.Heading>
          <p>
            Upload a resume to see job matches. Our AI will analyze your skills and match them with available jobs.
          </p>
          <Button as={Link} to="/upload" variant="primary">
            Upload Resume Now
          </Button>
        </Alert>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this resume?</p>
          {resumeToDelete && (
            <div className="bg-light p-3 rounded">
              <strong>Resume Details:</strong><br />
              Uploaded: {new Date(resumeToDelete.uploaded_at).toLocaleDateString()}<br />
              ATS Score: {resumeToDelete.ats_score || 0}%<br />
              Skills: {resumeToDelete.skills?.substring(0, 100)}...
            </div>
          )}
          <p className="mt-3 text-danger">
            ⚠️ This action cannot be undone. All match data will be permanently deleted.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Yes, Delete Resume'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* How it works section */}
      <Card className="mt-4 bg-light">
        <Card.Body>
          <h5>How it works:</h5>
          <Row>
            <Col md={3}>
              <div className="text-center">
                <div className="display-4">📄</div>
                <p>1. Upload Resume</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <div className="display-4">🤖</div>
                <p>2. AI Parsing</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <div className="display-4">🎯</div>
                <p>3. Job Matching</p>
              </div>
            </Col>
            <Col md={3}>
              <div className="text-center">
                <div className="display-4">📊</div>
                <p>4. Get Results</p>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  )
}

export default Dashboard