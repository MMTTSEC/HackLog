import { useEffect, useState } from 'react';
import { Container, Row, Col, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
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
  const [likesById, setLikesById] = useState<Record<number, number>>({});
  const [deletingIds, setDeletingIds] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const res = await fetch(`/api/articles?where=authorId=${encodeURIComponent(String(user.id))}`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setArticles(list);

        // Fetch like counts for these articles
        try {
          const likesRes = await fetch('/api/article_likes');
          const likesData = await likesRes.json();
          const map: Record<number, number> = {};
          if (Array.isArray(likesData)) {
            for (const row of likesData) {
              const aId = Number(row.articleId);
              const c = row.likeCount != null ? Number(row.likeCount) : 0;
              map[aId] = c;
            }
          }
          setLikesById(map);
        } catch (_) {
          setLikesById({});
        }
      } catch (_) {
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleDelete = async (id: number) => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this article?')) return;
    if (deletingIds[id]) return;
    setDeletingIds(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/articles/${id}` , { method: 'DELETE' });
      if (res.ok) {
        setArticles(prev => prev.filter(a => a.id !== id));
        setLikesById(prev => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
      }
    } catch (_) {
    } finally {
      setDeletingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  return <ProtectedRoute roles={['user']}>
    <div className="page-content">
      <Container>
        <Row className="mb-5 align-items-center my-articles-toolbar">
          <Col>
            <h2 className="mb-0">My Articles</h2>
          </Col>
          <Col className="text-end">
            <a href="/my-articles/new" className="btn btn-success my-articles-add">Add Article</a>
          </Col>
        </Row>

        {loading ? (
          <p className="text-muted">Loading your articles...</p>
        ) : articles.length === 0 ? (
          <p className="text-muted">You have not created any articles yet.</p>
        ) : (
          <Table striped bordered hover responsive variant="dark" className="my-articles-table">
            <thead>
              <tr>
                <th style={{width:'80px'}}>ID</th>
                <th>Title</th>
                <th style={{width:'180px'}}>Created</th>
                <th style={{width:'180px'}}>Modified</th>
                <th style={{width:'110px'}}>Featured</th>
                <th style={{width:'90px'}}>Likes</th>
                <th style={{width:'120px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a: any) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td><a className="my-article-link" href={`/articles/${a.id}`}>{a.title}</a></td>
                  <td>{a.created ? new Date(a.created).toLocaleString() : ''}</td>
                  <td>{a.modified ? new Date(a.modified).toLocaleString() : ''}</td>
                  <td>
                    {String(a.featured ?? 0) === '1' ? <span className="badge bg-success">Yes</span> : <span className="badge bg-secondary">No</span>}
                  </td>
                  <td>{likesById[a.id] ?? 0}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Link 
                        to={`/my-articles/edit/${a.id}`} 
                        className="btn btn-sm btn-outline-success"
                        state={{ article: a }}
                      >
                        Edit
                      </Link>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(a.id)}
                        disabled={!!deletingIds[a.id]}
                      >
                        {deletingIds[a.id] ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
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
