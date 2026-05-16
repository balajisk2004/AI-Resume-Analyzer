import React, { useState } from 'react'
import { Card, Form, Button, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const ResumeUpload = () => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [parsedData, setParsedData] = useState(null)
  const [recommendedJobs, setRecommendedJobs] = useState([])
  const navigate = useNavigate()

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please upload PDF or DOCX file only')
        setFile(null)
        return
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size should be less than 10MB')
        setFile(null)
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    setError(null)

    try {
      const token = localStorage.getItem('access_token')
      console.log('Uploading resume...')
      
      const response = await axios.post('http://localhost:8000/api/resumes/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('Upload response:', response.data)
      setParsedData(response.data)
      setRecommendedJobs(response.data.recommended_jobs || [])
      setSuccess('Resume uploaded and analyzed successfully!')
      
      // Don't redirect immediately, show results first
      setTimeout(() => {
        navigate('/dashboard')
      }, 5000)
    } catch (error) {
      console.error('Upload error:', error)
      setError(error.response?.data?.error || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow">
            <Card.Header as="h4" className="bg-primary text-white">
              Upload Resume
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Select Resume (PDF or DOCX)</Form.Label>
                  <Form.Control 
                    type="file" 
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  <Form.Text className="text-muted">
                    Supported formats: PDF, DOCX. Max size: 10MB
                  </Form.Text>
                </Form.Group>
                
                <Button variant="primary" type="submit" disabled={uploading} className="w-100">
                  {uploading ? <><Spinner animation="border" size="sm" /> Analyzing Resume...</> : 'Upload & Analyze'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {parsedData && (
        <Row className="mt-4 justify-content-center">
          <Col md={8}>
            <Card className="shadow">
              <Card.Header as="h5" className="bg-success text-white">
                 Resume Analysis Results
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h6> ATS Score:</h6>
                    <div className="progress mb-3" style={{ height: '30px' }}>
                      <div 
                        className="progress-bar bg-info" 
                        style={{ width: `${parsedData.ats_score || 0}%` }}
                      >
                        {parsedData.ats_score || 0}%
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <h6> Extracted Skills:</h6>
                    <div>
                      {parsedData.skills && parsedData.skills.split(',').map((skill, idx) => (
                        <Badge key={idx} bg="primary" className="me-1 mb-1">
                          {skill.trim()}
                        </Badge>
                      ))}
                    </div>
                  </Col>
                </Row>
                
                <hr />
                
                <h6> Education:</h6>
                <p className="small">{parsedData.education}</p>
                
                <h6> Experience:</h6>
                <p className="small">{parsedData.experience}</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {recommendedJobs.length > 0 && (
        <Row className="mt-4 justify-content-center">
          <Col md={10}>
            <Card className="shadow">
              <Card.Header as="h5" className="bg-warning text-dark">
                 Recommended Jobs Based on Your Resume
              </Card.Header>
              <Card.Body>
                <Row>
                  {recommendedJobs.map((job, idx) => (
                    <Col md={6} key={idx} className="mb-3">
                      <Card className="h-100">
                        <Card.Body>
                          <Card.Title className="text-primary">{job.job_title}</Card.Title>
                          <Card.Subtitle className="mb-2 text-muted">{job.company}</Card.Subtitle>
                          <div className="mb-2">
                            <Badge bg="success">Match: {job.match_score}%</Badge>
                            <Badge bg="info" className="ms-2">ATS: {job.ats_score}%</Badge>
                          </div>
                          <div className="small">
                            <strong>Matched Skills:</strong> {job.matched_skills.substring(0, 80)}...
                          </div>
                          <Button 
                            variant="link" 
                            className="mt-2 p-0"
                            onClick={() => navigate('/matches')}
                          >
                            View Details →
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
                <div className="text-center mt-3">
                  <Button variant="primary" onClick={() => navigate('/matches')}>
                    View All Matches
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  )
}

export default ResumeUpload