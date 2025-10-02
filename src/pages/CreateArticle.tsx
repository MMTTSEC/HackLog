import { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ProtectedRoute from '../utils/ProtectedRoute';
import { useAuth } from '../utils/useAuth';

export default function CreateArticle() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [availableTags, setAvailableTags] = useState<Array<{id: number, name: string}>>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setError(null); }, [title, excerpt, content, selectedTagIds]);

  // Fetch available tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags');
        if (response.ok) {
          const tags = await response.json();
          setAvailableTags(Array.isArray(tags) ? tags : []);
        }
      } catch (err) {
        console.error('Failed to fetch tags:', err);
      }
    };
    fetchTags();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      // 1) Create the article
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId: user.id, title, content, excerpt, featured: 0 })
      });
      const data = await res.json();
      if (data?.error) throw new Error(String(data.error));
      const articleId = Number(data.insertId ?? data.__insertId ?? data.id);

      // 2) Link selected tags to the article
      if (articleId && selectedTagIds.length > 0) {
        try {
          for (const tagId of selectedTagIds) {
            try {
              await fetch('/api/article_tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articleId, tagId })
              });
            } catch (_) {}
          }
        } catch (_) { /* ignore tag errors */ }
      }

      navigate('/my-articles');
    } catch (err: any) {
      setError(err?.message || 'Failed to create article');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute roles={['user']}>
      <div className="page-content auth-page">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} lg={7}>
              <h2 className="mb-3 text-center">Create Article</h2>
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
                  {saving ? 'Creating...' : 'Create Article'}
                </button>
              </form>
            </Col>
          </Row>
        </Container>
      </div>
    </ProtectedRoute>
  );
}

// Route meta
// @ts-ignore augment function value with route config
(CreateArticle as any).route = {
  path: '/my-articles/new',
  index: 8
};


