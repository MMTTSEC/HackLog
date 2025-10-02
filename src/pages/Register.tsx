import { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

Register.route = {
  path: '/register',
  menuLabel: 'Register',
  index: 8
}

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
      });
      const data = await res.json();
      if (data && !data.error) {
        navigate('/login');
      } else {
        setError(String(data?.error || 'Registration failed'));
      }
    } catch (_) {
      setError('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content auth-page">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <h2 className="mb-3 text-center">Create account</h2>
            <form onSubmit={onSubmit} className="auth-form">
              {error && <div className="alert alert-danger py-2">{error}</div>}
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input className="form-control" value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button className="btn btn-success w-100 auth-submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </button>
              <div className="text-center mt-3">
                Already have an account? <Link to="/login" className="link-light">Log in</Link>
              </div>
            </form>
          </Col>
        </Row>
      </Container>
    </div>
  );
}


