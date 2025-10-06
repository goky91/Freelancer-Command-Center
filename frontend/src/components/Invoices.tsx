import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Alert, Card, Badge, Row, Col } from 'react-bootstrap';
import { invoicesAPI, clientsAPI, timeEntriesAPI } from '../api';
import { Invoice, Client, TimeEntry } from '../types';

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState({
    client: '',
    time_entry: '',
    invoice_number: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    status: 'draft',
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [invoicesData, clientsData, entriesData] = await Promise.all([
        invoicesAPI.getAll(),
        clientsAPI.getAll(),
        timeEntriesAPI.getAll(),
      ]);
      setInvoices(invoicesData);
      setClients(clientsData);
      setTimeEntries(entriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleShowModal = (invoice?: Invoice) => {
    if (invoice) {
      setEditingInvoice(invoice);
      setFormData({
        client: invoice.client.toString(),
        time_entry: invoice.time_entry.toString(),
        invoice_number: invoice.invoice_number,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        status: invoice.status,
        notes: invoice.notes || '',
      });
    } else {
      setEditingInvoice(null);
      const nextInvoiceNumber = `INV-${Date.now()}`;
      setFormData({
        client: '',
        time_entry: '',
        invoice_number: nextInvoiceNumber,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: '',
        status: 'draft',
        notes: '',
      });
    }
    setShowModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingInvoice(null);
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
        time_entry: parseInt(formData.time_entry),
        invoice_number: formData.invoice_number,
        issue_date: formData.issue_date,
        due_date: formData.due_date,
        status: formData.status as 'draft' | 'sent' | 'paid',
        notes: formData.notes,
      };

      if (editingInvoice) {
        await invoicesAPI.update(editingInvoice.id, data);
      } else {
        await invoicesAPI.create(data);
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
        setError('Error saving invoice.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await invoicesAPI.delete(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      const blob = await invoicesAPI.downloadPDF(invoice.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF');
    }
  };

  const handleMarkAsSent = async (id: number) => {
    try {
      await invoicesAPI.markAsSent(id);
      await loadData();
    } catch (error) {
      console.error('Error marking invoice:', error);
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    try {
      await invoicesAPI.markAsPaid(id);
      await loadData();
    } catch (error) {
      console.error('Error marking invoice:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: string } = {
      draft: 'secondary',
      sent: 'warning',
      paid: 'success',
    };
    const labels: { [key: string]: string } = {
      draft: 'Draft',
      sent: 'Sent',
      paid: 'Paid',
    };
    return <Badge bg={badges[status]}>{labels[status]}</Badge>;
  };

  const filteredTimeEntries = formData.client
    ? timeEntries.filter((entry) => entry.client.toString() === formData.client)
    : [];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Invoices</h1>
        <Button variant="primary" onClick={() => handleShowModal()}>
          + Create Invoice
        </Button>
      </div>

      <Card>
        <Card.Body>
          {invoices.length === 0 ? (
            <p className="text-center text-muted">No invoices. Create your first invoice!</p>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Amount (RSD)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>{invoice.invoice_number}</td>
                    <td>{invoice.client_name}</td>
                    <td>{new Date(invoice.issue_date).toLocaleDateString('en-US')}</td>
                    <td>{new Date(invoice.due_date).toLocaleDateString('en-US')}</td>
                    <td>{parseFloat(invoice.total_amount).toLocaleString('en-US')}</td>
                    <td>{getStatusBadge(invoice.status)}</td>
                    <td>
                      <Button
                        variant="success"
                        size="sm"
                        className="me-2"
                        onClick={() => handleDownloadPDF(invoice)}
                      >
                        PDF
                      </Button>
                      {invoice.status === 'draft' && (
                        <Button
                          variant="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleMarkAsSent(invoice.id)}
                        >
                          Mark Sent
                        </Button>
                      )}
                      {invoice.status === 'sent' && (
                        <Button
                          variant="success"
                          size="sm"
                          className="me-2"
                          onClick={() => handleMarkAsPaid(invoice.id)}
                        >
                          Mark Paid
                        </Button>
                      )}
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowModal(invoice)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(invoice.id)}
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

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingInvoice ? 'Edit Invoice' : 'Create Invoice'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="invoice_number">
                  <Form.Label>Invoice Number *</Form.Label>
                  <Form.Control
                    type="text"
                    name="invoice_number"
                    value={formData.invoice_number}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="status">
                  <Form.Label>Status *</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

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

            <Form.Group className="mb-3" controlId="time_entry">
              <Form.Label>Time Entry *</Form.Label>
              <Form.Select
                name="time_entry"
                value={formData.time_entry}
                onChange={handleChange}
                required
                disabled={!formData.client}
              >
                <option value="">
                  {formData.client ? 'Select time entry' : 'Select client first'}
                </option>
                {filteredTimeEntries.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.month}/{entry.year} - {entry.hours}h @ {entry.hourly_rate} RSD = {entry.total_amount} RSD
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="issue_date">
                  <Form.Label>Issue Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="issue_date"
                    value={formData.issue_date}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="due_date">
                  <Form.Label>Due Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="notes">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes..."
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

export default Invoices;
