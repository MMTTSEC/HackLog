import { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ProtectedRoute from '../utils/ProtectedRoute';
import { useAuth } from '../utils/useAuth';

export default function EditArticle() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const passed = (location.state as any)?.article;
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [availableTags, setAvailableTags] = useState<Array<{id: number, name: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setError(null); }, [title, excerpt, content, selectedTagIds]);

  useEffect(() => {
    if (passed) {
      setTitle(passed.title || '');
      setExcerpt(passed.excerpt || '');
      setContent(passed.content || '');
    }
  }, [passed]);

  useEffect(() => {
    const run = async () => {
      if (!id || !user) return;
      try {
        let article = passed;
        if (!article) {
          const res = await fetch(`/api/articles/${id}`);
          if (!res.ok) throw new Error('Article not found');
          article = await res.json();
          setTitle(article.title || '');
          setExcerpt(article.excerpt || '');
          setContent(article.content || '');
        }
        const authorId = Number(article.authorId);
        if (authorId !== Number(user.id) && user.role !== 'admin') throw new Error('You can only edit your own articles');
        let currentNames: string[] = [];
        const tRes = await fetch(`/api/articles_with_tags/${id}`);
        if (tRes.ok) {
          const aWT = await tRes.json();
          if (aWT?.tags) currentNames = String(aWT.tags).split(',').map((s: string) => s.trim()).filter(Boolean);
        }
        const allRes = await fetch('/api/tags');
        if (allRes.ok) {
          const all = await allRes.json();
          const list = Array.isArray(all) ? all : [];
          setAvailableTags(list);
          if (currentNames.length > 0) setSelectedTagIds(list.filter((t: any) => currentNames.includes(t.name)).map((t: any) => Number(t.id)));
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load article');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, content, excerpt })
      });
      const data = await res.json();
      if (data?.error) throw new Error(String(data.error));
      try {
        await fetch(`/api/article_tags?where=articleId=${id}`, { method: 'DELETE' });
        for (const tagId of selectedTagIds) {
          await fetch('/api/article_tags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ articleId: Number(id), tagId }) });
        }
      } catch (_) {}
      navigate('/my-articles');
    } catch (err: any) {
      setError(err?.message || 'Failed to update article');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute roles={['user']}>
        <div className="page-content auth-page">
          <Container>
            <Row className="justify-content-center">
              <Col md={8} lg={7}>
                <div className="text-center">Loading...</div>
              </Col>
            </Row>
          </Container>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute roles={['user']}>
      <div className="page-content auth-page">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={7}>
              <h2 className="mb-3 text-center">Edit Article</h2>
              <form onSubmit={handleSubmit} className="auth-form">
                {error && <div className="alert alert-danger py-2">{error}</div>}
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Excerpt</label>
                  <textarea className="form-control" rows={3} value={excerpt} onChange={e => setExcerpt(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Content</label>
                  <textarea className="form-control" rows={10} value={content} onChange={e => setContent(e.target.value)} required />
                </div>
                <div className="mb-4">
                  <label className="form-label">Tags</label>
                  <select
                    className="form-select tag-select"
                    aria-label="Select tags to add"
                    value=""
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value && !selectedTagIds.includes(value)) {
                        setSelectedTagIds([...selectedTagIds, value]);
                      }
                    }}
                  >
                    <option value="" disabled>Select tags…</option>
                    {availableTags.map(tag => (
                      <option key={tag.id} value={tag.id}>{tag.name}</option>
                    ))}
                  </select>
                  <div className="tag-chips mt-2">
                    {selectedTagIds.map(id => {
                      const tag = availableTags.find(t => t.id === id);
                      if (!tag) return null;
                      return (
                        <span key={id} className="tag-chip me-2 mb-2">
                          <span className="tag-chip-label">{tag.name}</span>
                          <button type="button" className="tag-chip-remove" aria-label={`Remove ${tag.name}`}
                            onClick={() => setSelectedTagIds(selectedTagIds.filter(tid => tid !== id))}
                          >
                            ✕
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
                <button className="btn btn-success w-100 auth-submit" disabled={saving}>
                  {saving ? 'Updating...' : 'Update Article'}
                </button>
              </form>
            </Col>
          </Row>
        </Container>
      </div>
    </ProtectedRoute>
  );
}

// @ts-ignore
(EditArticle as any).route = {
  path: '/my-articles/edit/:id',
  index: 9
};
