import React, { useEffect, useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { clientsAPI, timeEntriesAPI, invoicesAPI } from '../api';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalTimeEntries: 0,
    totalInvoices: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [clients, timeEntries, invoices] = await Promise.all([
        clientsAPI.getAll(),
        timeEntriesAPI.getAll(),
        invoicesAPI.getAll(),
      ]);

      const totalRevenue = invoices.reduce(
        (sum, invoice) => sum + parseFloat(invoice.total_amount),
        0
      );

      setStats({
        totalClients: clients.length,
        totalTimeEntries: timeEntries.length,
        totalInvoices: invoices.length,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4">Dashboard</h1>
      <Row>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title className="text-muted">Clients</Card.Title>
              <h2 className="display-4">{stats.totalClients}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title className="text-muted">Time Entries</Card.Title>
              <h2 className="display-4">{stats.totalTimeEntries}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title className="text-muted">Invoices</Card.Title>
              <h2 className="display-4">{stats.totalInvoices}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title className="text-muted">Total Revenue</Card.Title>
              <h2 className="display-6">{stats.totalRevenue.toLocaleString('en-US')} RSD</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
