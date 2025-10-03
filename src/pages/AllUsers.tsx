import { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import ProtectedRoute from '../utils/ProtectedRoute';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';

AllUsers.route = {
  path: '/admin/users',
  menuLabel: 'All Users',
  index: 6,
  parent: '/admin'
}

export default function AllUsers() {
  const [users, setUsers] = useState<Array<{ id: number; created: string; email: string; username: string; role: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingUserId, setSavingUserId] = useState<number | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; variant: 'success' | 'danger' }>({ 
    show: false, 
    message: '', 
    variant: 'success' 
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetch('/api/users')
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        const normalized = (Array.isArray(data) ? data : []).map((u: any) => ({
          id: Number(u.id),
          created: String(u.created || ''),
          email: String(u.email || ''),
          username: String(u.username || ''),
          role: String(u.role || '')
        }));
        setUsers(normalized);
      })
      .catch((e: any) => {
        if (!mounted) return;
        setError(e?.message || 'Failed to load users');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const handleDeleteClick = (userId: number) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    setShowDeleteModal(false);
    setDeletingUserId(userToDelete);
    
    const res = await fetch(`/api/users/${userToDelete}`, { method: 'DELETE' });
    
    if (res.ok) {
      setUsers(prev => prev.filter(u => u.id !== userToDelete));
      setToast({ show: true, message: 'User deleted successfully!', variant: 'success' });
    } else {
      setToast({ show: true, message: 'Failed to delete user', variant: 'danger' });
    }
    
    setDeletingUserId(null);
    setUserToDelete(null);
  };

  return <ProtectedRoute roles={['admin']}>
    <div className="page-content admin-table">
      <Container>
        <Row className="mb-3">
          <Col>
            <h2>All Users</h2>
            <p className="text-muted">Manage registered users.</p>
          </Col>
        </Row>

        {error && (
          <Row className="mb-3">
            <Col>
              <div className="alert alert-danger" role="alert">{error}</div>
            </Col>
          </Row>
        )}

        {loading ? (
          <Row>
            <Col>
              <p className="text-muted">Loading…</p>
            </Col>
          </Row>
        ) : (
          <Row>
            <Col>
              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle admin-table-table">
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Username</th>
                      <th scope="col">Email</th>
                      <th scope="col">Role</th>
                      <th scope="col">Created</th>
                      <th scope="col" className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.username}</td>
                        <td className="text-muted">{u.email}</td>
                        <td>
                          <select
                            className="form-select form-select-sm bg-dark text-white border-secondary"
                            value={u.role}
                            disabled={savingUserId === u.id}
                            onChange={async (e) => {
                              const newRole = e.target.value;
                              const previousRole = u.role;
                              setSavingUserId(u.id);
                              setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: newRole } : x));
                              
                              const res = await fetch(`/api/users/${u.id}/role`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ role: newRole })
                              });
                              
                              if (!res.ok) {
                                setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: previousRole } : x));
                              }
                              
                              setSavingUserId(null);
                            }}
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td>{u.created ? new Date(u.created).toLocaleDateString() : ''}</td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteClick(u.id)}
                            disabled={deletingUserId === u.id}
                          >
                            {deletingUserId === u.id ? 'Deleting…' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center text-muted">No users found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>
        )}
      </Container>

      <ConfirmModal
        show={showDeleteModal}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      <Toast
        show={toast.show}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  </ProtectedRoute>
}
