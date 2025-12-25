import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { clientsAPI } from '../services/api';
import { Client } from '../types';

function Dashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const { photographer, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await clientsAPI.getAll();
      setClients(response.data);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await clientsAPI.create(newClientName, newClientEmail);
      setNewClientName('');
      setNewClientEmail('');
      setShowModal(false);
      loadClients();
    } catch (error) {
      console.error('Failed to create client:', error);
      alert('Failed to create client');
    }
  };

  const handleDeleteClient = async (id: number) => {
    if (!confirm('Are you sure you want to delete this client and all their photos?')) {
      return;
    }
    try {
      await clientsAPI.delete(id);
      loadClients();
    } catch (error) {
      console.error('Failed to delete client:', error);
      alert('Failed to delete client');
    }
  };

  const copyLink = (uniqueLink: string) => {
    const url = `${window.location.origin}/gallery/${uniqueLink}`;
    navigator.clipboard.writeText(url);
    alert('Gallery link copied to clipboard!');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {photographer?.studioName}</h1>
          <p style={{ color: '#666', marginTop: '5px' }}>{photographer?.email}</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + New Client
          </button>
          <button className="btn-secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading clients...</div>
      ) : clients.length === 0 ? (
        <div className="empty-state">
          <h2>No clients yet</h2>
          <p>Create your first client to start sharing photos</p>
        </div>
      ) : (
        <div className="clients-grid">
          {clients.map((client) => (
            <div key={client.id} className="client-card">
              <h3>{client.name}</h3>
              {client.email && <p className="client-stats">Email: {client.email}</p>}
              <p className="client-stats">
                Photos: {client.photo_count || 0} | Selected: {client.selected_count || 0}
              </p>
              <p className="client-link">
                Gallery: /gallery/{client.unique_link}
              </p>
              <div className="client-actions">
                <button
                  className="btn-small btn-primary"
                  onClick={() => navigate(`/client/${client.id}`)}
                >
                  Manage Photos
                </button>
                <button
                  className="btn-small btn-secondary"
                  onClick={() => copyLink(client.unique_link)}
                >
                  Copy Link
                </button>
                <button
                  className="btn-small btn-danger"
                  onClick={() => handleDeleteClient(client.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Client</h2>
            <form onSubmit={handleCreateClient}>
              <div className="form-group">
                <label>Client Name *</label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email (optional)</label>
                <input
                  type="email"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  Create
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
