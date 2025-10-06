import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { authAPI } from '../api';

interface RegisterProps {
  onRegister: (access: string, refresh: string) => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.password2) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await authAPI.register(formData);
      // After registration, automatically log in the user
      const loginData = await authAPI.login(formData.username, formData.password);
      onRegister(loginData.access, loginData.refresh);
    } catch (err: any) {
      const errorMsg = err.response?.data;
      if (typeof errorMsg === 'object') {
        const errors = Object.values(errorMsg).flat().join(' ');
        setError(errors);
      } else {
        setError('Registration error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row className="justify-content-center mt-5">
      <Col md={8} lg={6}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Register</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="first_name">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="first_name"
                      placeholder="Enter first name"
                      value={formData.first_name}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="last_name">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="last_name"
                      placeholder="Enter last name"
                      value={formData.last_name}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3" controlId="username">
                <Form.Label>Username *</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Password *</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="password2">
                    <Form.Label>Confirm Password *</Form.Label>
                    <Form.Control
                      type="password"
                      name="password2"
                      placeholder="Confirm password"
                      value={formData.password2}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button
                variant="primary"
                type="submit"
                className="w-100"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </Form>
            <div className="text-center mt-3">
              <p>
                Already have an account? <Link to="/login">Log In</Link>
              </p>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default Register;
