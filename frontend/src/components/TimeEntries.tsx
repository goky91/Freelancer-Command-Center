import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Alert, Card, Row, Col } from 'react-bootstrap';
import { timeEntriesAPI, clientsAPI } from '../api';
import { TimeEntry, Client } from '../types';

const TimeEntries: React.FC = () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [formData, setFormData] = useState({
    client: '',
    month: '',
    year: new Date().getFullYear().toString(),
    hours: '',
    hourly_rate: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [entriesData, clientsData] = await Promise.all([
        timeEntriesAPI.getAll(),
        clientsAPI.getAll(),
      ]);
      setTimeEntries(entriesData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleShowModal = (entry?: TimeEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        client: entry.client.toString(),
        month: entry.month.toString(),
        year: entry.year.toString(),
        hours: entry.hours,
        hourly_rate: entry.hourly_rate,
        description: entry.description || '',
      });
    } else {
      setEditingEntry(null);
      setFormData({
        client: '',
        month: '',
        year: new Date().getFullYear().toString(),
        hours: '',
        hourly_rate: '',
        description: '',
      });
    }
    setShowModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEntry(null);
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      const data = {
        client: parseInt(formData.client),
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        hours: formData.hours,
        hourly_rate: formData.hourly_rate,
        description: formData.description,
      };

      if (editingEntry) {
        await timeEntriesAPI.update(editingEntry.id, data);
      } else {
        await timeEntriesAPI.create(data);
      }
      await loadData();
      handleCloseModal();
    } catch (err: any) {
      const errorMsg = err.response?.data;
      if (typeof errorMsg === 'object') {
        const errors = Object.entries(errorMsg)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        setError(errors);
      } else {
        setError('Error saving entry.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await timeEntriesAPI.delete(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting entry:', error);
      }
    }
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Time Entries</h1>
        <Button variant="primary" onClick={() => handleShowModal()}>
          + Add Entry
        </Button>
      </div>

      <Card>
        <Card.Body>
          {timeEntries.length === 0 ? (
            <p className="text-center text-muted">No time entries. Add your first entry!</p>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Month/Year</th>
                  <th>Hours</th>
                  <th>Hourly Rate (RSD)</th>
                  <th>Total (RSD)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {timeEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.client_name}</td>
                    <td>
                      {months.find((m) => m.value === entry.month)?.label} {entry.year}
                    </td>
                    <td>{entry.hours}</td>
                    <td>{parseFloat(entry.hourly_rate).toLocaleString('en-US')}</td>
                    <td>{parseFloat(entry.total_amount).toLocaleString('en-US')}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowModal(entry)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
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
            {editingEntry ? 'Edit Entry' : 'Add Entry'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="client">
              <Form.Label>Client *</Form.Label>
              <Form.Select
                name="client"
                value={formData.client}
                onChange={handleChange}
                required
              >
                <option value="">Select client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="month">
                  <Form.Label>Month *</Form.Label>
                  <Form.Select
                    name="month"
                    value={formData.month}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select month</option>
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="year">
                  <Form.Label>Year *</Form.Label>
                  <Form.Control
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    min="2000"
                    max="2100"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="hours">
                  <Form.Label>Hours *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="hours"
                    value={formData.hours}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="hourly_rate">
                  <Form.Label>Hourly Rate (RSD) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="hourly_rate"
                    value={formData.hourly_rate}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the work performed..."
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

export default TimeEntries;
