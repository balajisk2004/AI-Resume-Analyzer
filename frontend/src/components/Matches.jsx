import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Spinner, Alert, Form, Badge, Button } from 'react-bootstrap'
import axios from 'axios'

const Matches = () => {
  const [resumes, setResumes] = useState([])
  const [selectedResume, setSelectedResume] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState(null)
  const [showJobModal, setShowJobModal] = useState(false)

  useEffect(() => {
    fetchResumes()
  }, [])

  useEffect(() => {
    if (selectedResume) {
      fetchMatches(selectedResume)
    }
  }, [selectedResume])

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get('http://localhost:8000/api/resumes/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setResumes(response.data)
      if (response.data.length > 0) {
        setSelectedResume(response.data[0].id)
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  const fetchMatches = async (resumeId) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get(`http://localhost:8000/api/resumes/${resumeId}/matches/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMatches(response.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleJobClick = (match) => {
    setSelectedJob(match)
    setShowJobModal(true)
  }

  if (resumes.length === 0) {
    return (
      <Alert variant="info">
        <Alert.Heading>No resumes uploaded yet!</Alert.Heading>
        <p>Upload your first resume to see job matches based on your skills and experience.</p>
        <Button href="/upload" variant="primary">Upload Resume Now</Button>
      </Alert>
    )
  }

  return (
    <div>
      <h2 className="mb-4"> Job Matches</h2>

      <Form.Group className="mb-4">
        <Form.Label>Select Resume to View Matches:</Form.Label>
        <Form.Select
          value={selectedResume || ''}
          onChange={(e) => setSelectedResume(parseInt(e.target.value))}
        >
          {resumes.map((resume) => (
            <option key={resume.id} value={resume.id}>
              Resume uploaded on {new Date(resume.uploaded_at).toLocaleDateString()}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : matches.length === 0 ? (
        <Alert variant="warning">
          <Alert.Heading>No matches found for this resume</Alert.Heading>
          <p>We couldn't find any jobs matching your skills. Try uploading a more detailed resume or check back later for new jobs.</p>
        </Alert>
      ) : (
        <>
          <div className="mb-3">
            <h5>Found {matches.length} matching jobs</h5>
            <p>Sorted by match percentage (highest first)</p>
          </div>
          
          <Row>
            {matches.map((match) => (
              <Col md={12} key={match.id} className="mb-3">
                <Card 
                  className="shadow-sm" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleJobClick(match)}
                >
                  <Card.Body>
                    <Row>
                      <Col md={8}>
                        <Card.Title className="text-primary">{match.job_title}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">
                          {match.company} • {match.location}
                        </Card.Subtitle>
                      </Col>
                      <Col md={4} className="text-end">
                        <div className="display-6 text-success">{match.match_score}%</div>
                        <small>Match Score</small>
                      </Col>
                    </Row>
                    
                    <Row className="mt-3">
                      <Col md={6}>
                        <div className="mb-2">
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
                      </Col>
                      <Col md={6}>
                        <div className="mb-2">
                          <strong>ATS Score:</strong>
                          <div className="progress mt-1" style={{ height: '25px' }}>
                            <div className="progress-bar bg-info" style={{ width: `${match.ats_score}%` }}>
                              {match.ats_score}%
                            </div>
                          </div>
                        </div>
                      </Col>
                    </Row>
                    
                    <Row className="mt-2">
                      <Col md={6}>
                        <div>
                          <Badge bg="success">✓ Matched: {match.matched_skills.substring(0, 60)}</Badge>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div>
                          <Badge bg="danger">✗ Missing: {match.missing_skills.substring(0, 60)}</Badge>
                        </div>
                      </Col>
                    </Row>
                    
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
        </>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <Modal show={showJobModal} onHide={() => setShowJobModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{selectedJob.job_title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h5 className="text-primary">{selectedJob.company}</h5>
            <div className="mb-3">
              <Badge bg="secondary">{selectedJob.location}</Badge>
              <Badge bg="info" className="ms-2">{selectedJob.experience}+ years</Badge>
            </div>
            
            <div className="mb-3">
              <strong>Match Score:</strong>
              <div className="progress mt-1" style={{ height: '30px' }}>
                <div
                  className={`progress-bar ${selectedJob.match_score >= 70 ? 'bg-success' : selectedJob.match_score >= 50 ? 'bg-warning' : 'bg-danger'}`}
                  style={{ width: `${selectedJob.match_score}%` }}
                >
                  {selectedJob.match_score}% Match
                </div>
              </div>
            </div>
            
            <hr />
            
            <h6> Matched Skills:</h6>
            <p className="text-success">{selectedJob.matched_skills}</p>
            
            <h6>⚠️ Missing Skills to Improve:</h6>
            <p className="text-danger">{selectedJob.missing_skills}</p>
            
            <h6> Recommendations:</h6>
            <p className="text-info">{selectedJob.recommendations}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowJobModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={() => {
              setShowJobModal(false)
              window.location.href = '/jobs'
            }}>
              View All Jobs
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  )
}

export default Matches