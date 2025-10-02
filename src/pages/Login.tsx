import { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

Login.route = {
  path: '/login',
  menuLabel: 'Login',
  index: 2
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data && !data.error) {
        navigate('/');
      } else {
        setError(String(data?.error || 'Login failed'));
      }
    } catch (_) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <h2 className="mb-3">Log in</h2>
            <form onSubmit={onSubmit} className="auth-form">
              {error && <div className="alert alert-danger py-2">{error}</div>}
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button className="btn btn-success w-100" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
              <div className="text-center mt-3">
                No account? <Link to="/register" className="link-light">Create one</Link>
              </div>
            </form>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
