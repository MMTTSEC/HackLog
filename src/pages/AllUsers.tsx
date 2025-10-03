import { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import ProtectedRoute from '../utils/ProtectedRoute';

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
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.username}</td>
                        <td className="text-muted">{u.email}</td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'bg-primary' : 'bg-secondary'}`}>{u.role}</span>
                        </td>
                        <td>{u.created ? new Date(u.created).toLocaleDateString() : ''}</td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center text-muted">No users found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  </ProtectedRoute>
}
