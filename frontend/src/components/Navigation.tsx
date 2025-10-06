import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { User } from '../types';

interface NavigationProps {
  user: User | null;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard">
          Freelance Command Center
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard">
              Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/clients">
              Clients
            </Nav.Link>
            <Nav.Link as={Link} to="/time-entries">
              Time Entries
            </Nav.Link>
            <Nav.Link as={Link} to="/invoices">
              Invoices
            </Nav.Link>
          </Nav>
          <Nav>
            <Navbar.Text className="me-3">
              {user?.first_name || user?.username}
            </Navbar.Text>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              Log Out
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
