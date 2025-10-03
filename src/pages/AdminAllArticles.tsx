import { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import ProtectedRoute from '../utils/ProtectedRoute';

AdminAllArticles.route = {
  path: '/admin/articles',
  menuLabel: 'All Articles',
  index: 7,
  parent: '/admin'
}

export default function AdminAllArticles() {
  const [articles, setArticles] = useState<any[]>([]);
  const [usersById, setUsersById] = useState<Record<number, { id: number; username: string }>>({});
  const [likesByArticleId, setLikesByArticleId] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      fetch('/api/articles_with_tags'),
      fetch('/api/users'),
      fetch('/api/article_likes')
    ])
      .then(async ([articlesRes, usersRes, likesRes]) => {
        const [articlesData, usersData, likesData] = await Promise.all([
          articlesRes.ok ? articlesRes.json() : Promise.reject(await articlesRes.text()),
          usersRes.ok ? usersRes.json() : Promise.reject(await usersRes.text()),
          likesRes.ok ? likesRes.json() : Promise.resolve([])
        ]);

        if (!isMounted) return;

       
        const normalizedArticles = (Array.isArray(articlesData) ? articlesData : []).map((a: any) => ({
          id: Number(a.id),
          authorId: Number(a.authorId),
          title: String(a.title || ''),
          excerpt: String(a.excerpt || ''),
          featured: Number(a.featured || 0),
          created: String(a.created || ''),
          modified: String(a.modified || ''),
          tags: a.tags ? String(a.tags).split(',').map((s: string) => s.trim()).filter(Boolean) : []
        }));

        // Map users by id
        const byId: Record<number, { id: number; username: string }> = {};
        if (Array.isArray(usersData)) {
          for (const u of usersData) {
            const uid = Number(u.id);
            byId[uid] = { id: uid, username: String(u.username || '') };
          }
        }

        // Likes map
        const likeCounts: Record<number, number> = {};
        if (Array.isArray(likesData)) {
          for (const l of likesData) {
            const aId = Number(l.articleId);
            const c = l.likeCount != null ? Number(l.likeCount) : 1;
            likeCounts[aId] = (likeCounts[aId] || 0) + c;
          }
        }

        setArticles(normalizedArticles);
        setUsersById(byId);
        setLikesByArticleId(likeCounts);
      })
      .catch((e) => {
        if (!isMounted) return;
        setError(typeof e === 'string' ? e : 'Failed to load admin articles');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const rows = useMemo(() => {
    return articles.map((a) => ({
      ...a,
      authorUsername: usersById[a.authorId]?.username || '—',
      likeCount: likesByArticleId[a.id] ?? 0
    }));
  }, [articles, usersById, likesByArticleId]);

  const handleDelete = async (articleId: number) => {
    if (!window.confirm('Delete this article? This cannot be undone.')) return;
    setDeletingId(articleId);
    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to delete');
      }
      // Remove from local state
      setArticles(prev => prev.filter(a => a.id !== articleId));
      setLikesByArticleId(prev => {
        const copy = { ...prev };
        delete copy[articleId];
        return copy;
      });
    } catch (e: any) {
      alert(e?.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  return <ProtectedRoute roles={['admin']}>
    <div className="page-content admin-table">
      <Container>
        <Row className="mb-3">
          <Col>
            <h2>All Articles (Admin)</h2>
            <p className="text-muted">Review every article in the system.</p>
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
                      <th scope="col">Title</th>
                      <th scope="col">Author</th>
                      <th scope="col">Featured</th>
                      <th scope="col">Tags</th>
                      <th scope="col">Created</th>
                      <th scope="col">Modified</th>
                      <th scope="col">Likes</th>
                      <th scope="col" className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td>{r.id}</td>
                        <td>
                          <a href={`/articles/${r.id}`} className="my-article-link">{r.title}</a>
                        </td>
                        <td>{r.authorUsername}</td>
                        <td>
                          <span className={`badge ${r.featured ? 'bg-success' : 'bg-secondary'}`}>
                            {r.featured ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td>
                          {(r.tags || []).length === 0 ? (
                            <span className="text-muted">—</span>
                          ) : (
                            (r.tags || []).map((t: string, i: number) => (
                              <span key={i} className="admin-tag me-1 mb-1">{t}</span>
                            ))
                          )}
                        </td>
                        <td>{r.created ? new Date(r.created).toLocaleString() : ''}</td>
                        <td>{r.modified ? new Date(r.modified).toLocaleString() : ''}</td>
                        <td>{r.likeCount}</td>
                        <td className="text-end">
                          <a href={`/my-articles/edit/${r.id}`} className="btn btn-sm btn-outline-light me-2">Edit</a>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(r.id)}
                            disabled={deletingId === r.id}
                          >
                            {deletingId === r.id ? 'Deleting…' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={9} className="text-center text-muted">No articles found.</td>
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
