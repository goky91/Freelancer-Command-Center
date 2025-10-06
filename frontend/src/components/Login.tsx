import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { authAPI } from '../api';

interface LoginProps {
  onLogin: (access: string, refresh: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authAPI.login(username, password);
      onLogin(data.access, data.refresh);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Login error. Please check your username and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row className="justify-content-center mt-5">
      <Col md={6} lg={4}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Login</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="username">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </Button>
            </Form>
            <div className="text-center mt-3">
              <p>
                Don't have an account? <Link to="/register">Register</Link>
              </p>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default Login;
