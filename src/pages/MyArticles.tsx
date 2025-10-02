import { useEffect, useState } from 'react';
import { Container, Row, Col, Table } from 'react-bootstrap';
import ProtectedRoute from '../utils/ProtectedRoute';
import { useAuth } from '../utils/useAuth';

MyArticles.route = {
  path: '/my-articles',
  menuLabel: 'My Articles',
  index: 5
}

export default function MyArticles() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const res = await fetch(`/api/articles?where=authorId=${encodeURIComponent(String(user.id))}`);
        const data = await res.json();
        setArticles(Array.isArray(data) ? data : []);
      } catch (_) {
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  return <ProtectedRoute roles={['user']}>
    <div className="page-content">
      <Container>
        <Row className="mb-3">
          <Col>
            <h2>My Articles</h2>
          </Col>
        </Row>

        {loading ? (
          <p className="text-muted">Loading your articles...</p>
        ) : articles.length === 0 ? (
          <p className="text-muted">You have not created any articles yet.</p>
        ) : (
          <Table striped bordered hover responsive variant="dark">
            <thead>
              <tr>
                <th style={{width:'80px'}}>ID</th>
                <th>Title</th>
                <th style={{width:'180px'}}>Created</th>
                <th style={{width:'180px'}}>Modified</th>
                <th style={{width:'110px'}}>Featured</th>
                <th style={{width:'120px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a: any) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td><a href={`/articles/${a.id}`}>{a.title}</a></td>
                  <td>{a.created ? new Date(a.created).toLocaleString() : ''}</td>
                  <td>{a.modified ? new Date(a.modified).toLocaleString() : ''}</td>
                  <td>{String(a.featured ?? 0) === '1' ? 'Yes' : 'No'}</td>
                  <td>
                    <a href="#" className="btn btn-sm btn-outline-light">Edit</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Container>
    </div>
  </ProtectedRoute>
}
