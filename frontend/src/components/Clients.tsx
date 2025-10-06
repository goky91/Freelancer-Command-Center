import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Alert, Card } from 'react-bootstrap';
import { clientsAPI } from '../api';
import { Client } from '../types';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    address: '',
    pib: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await clientsAPI.getAll();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const handleShowModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        email: client.email || '',
        company: client.company || '',
        address: client.address || '',
        pib: client.pib || '',
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        email: '',
        company: '',
        address: '',
        pib: '',
      });
    }
    setShowModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClient(null);
    setFormData({
      name: '',
      email: '',
      company: '',
      address: '',
      pib: '',
    });
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (editingClient) {
        await clientsAPI.update(editingClient.id, formData);
      } else {
        await clientsAPI.create(formData);
      }
      await loadClients();
      handleCloseModal();
    } catch (err: any) {
      setError('Error saving client.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await clientsAPI.delete(id);
        await loadClients();
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Clients</h1>
        <Button variant="primary" onClick={() => handleShowModal()}>
          + Add Client
        </Button>
      </div>

      <Card>
        <Card.Body>
          {clients.length === 0 ? (
            <p className="text-center text-muted">No clients. Add your first client!</p>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Tax ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td>{client.name}</td>
                    <td>{client.company || '-'}</td>
                    <td>{client.email || '-'}</td>
                    <td>{client.pib || '-'}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowModal(client)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(client.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingClient ? 'Edit Client' : 'Add Client'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="company">
              <Form.Label>Company</Form.Label>
              <Form.Control
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="pib">
              <Form.Label>Tax ID</Form.Label>
              <Form.Control
                type="text"
                name="pib"
                value={formData.pib}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="address">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Clients;
