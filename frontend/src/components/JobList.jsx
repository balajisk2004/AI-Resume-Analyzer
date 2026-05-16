import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Spinner, Alert, Badge, Form, Modal, Button } from 'react-bootstrap'
import axios from 'axios'

const JobList = () => {
  const [jobs, setJobs] = useState([])
  const [filteredJobs, setFilteredJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedJob, setSelectedJob] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    filterJobs()
  }, [searchTerm, jobs])

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get('http://localhost:8000/api/jobs/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setJobs(response.data)
      setFilteredJobs(response.data)
    } catch (error) {
      setError('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const filterJobs = () => {
    if (!searchTerm) {
      setFilteredJobs(jobs)
    } else {
      const filtered = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills_required.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredJobs(filtered)
    }
  }

  const handleJobClick = (job) => {
    setSelectedJob(job)
    setShowModal(true)
  }

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>
  if (error) return <Alert variant="danger">{error}</Alert>

  return (
    <div>
      <h2 className="mb-4">Available Jobs ({filteredJobs.length})</h2>
      
      <Form.Group className="mb-4">
        <Form.Control
          type="text"
          placeholder="Search jobs by title, company, skills, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      <Row>
        {filteredJobs.map((job) => (
          <Col md={6} lg={4} key={job.id} className="mb-4">
            <Card 
              className="h-100 shadow-sm job-card" 
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              onClick={() => handleJobClick(job)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Card.Body>
                <Card.Title className="text-primary">{job.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">{job.company}</Card.Subtitle>
                <div className="mb-2">
                  <Badge bg="secondary">{job.location}</Badge>
                  {job.experience_required > 0 && (
                    <Badge bg="info" className="ms-2">{job.experience_required}+ years</Badge>
                  )}
                  {job.salary_range && (
                    <Badge bg="success" className="ms-2">{job.salary_range}</Badge>
                  )}
                </div>
                <Card.Text>
                  <strong>Description:</strong><br />
                  {job.description.substring(0, 120)}...
                </Card.Text>
                <div>
                  <strong>Skills:</strong><br />
                  {job.skills_required.split(',').slice(0, 5).map((skill, idx) => (
                    <Badge key={idx} bg="light" text="dark" className="me-1 mb-1">
                      {skill.trim()}
                    </Badge>
                  ))}
                  {job.skills_required.split(',').length > 5 && (
                    <Badge bg="light" text="dark">+{job.skills_required.split(',').length - 5} more</Badge>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Job Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        {selectedJob && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selectedJob.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <h5 className="text-primary">{selectedJob.company}</h5>
              <div className="mb-3">
                <Badge bg="secondary">{selectedJob.location}</Badge>
                <Badge bg="info" className="ms-2">{selectedJob.experience_required}+ years experience</Badge>
                {selectedJob.salary_range && (
                  <Badge bg="success" className="ms-2">-- {selectedJob.salary_range}</Badge>
                )}
              </div>
              
              <hr />
              
              <h6> Job Description:</h6>
              <p>{selectedJob.description}</p>
              
              <h6> Requirements:</h6>
              <p>{selectedJob.requirements}</p>
              
              <h6> Required Skills:</h6>
              <div>
                {selectedJob.skills_required.split(',').map((skill, idx) => (
                  <Badge key={idx} bg="primary" className="me-2 mb-2">
                    {skill.trim()}
                  </Badge>
                ))}
              </div>
              
              <hr />
              <small className="text-muted">Posted on: {new Date(selectedJob.created_at).toLocaleDateString()}</small>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Close
              </Button>
              <Button variant="primary" onClick={() => {
                setShowModal(false)
                // You can add apply functionality here
                alert('Application feature coming soon!')
              }}>
                Apply Now
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      <style jsx>{`
        .job-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  )
}

export default JobList