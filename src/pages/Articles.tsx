import { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../utils/useAuth';
import Toast from '../components/Toast';

Articles.route = {
  path: '/articles',
  menuLabel: 'Articles',
  index: 3
}

type Article = {
  id: number;
  title: string;
  excerpt: string;
  tags?: string[];
  created?: string;
};

export default function Articles() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most-liked'>('newest');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [likesByArticleId, setLikesByArticleId] = useState<Record<number, number>>({});
  const [likingIds, setLikingIds] = useState<Record<number, boolean>>({});
  const [toast, setToast] = useState<{ show: boolean; message: string; variant: 'success' | 'danger' | 'warning' }>({ 
    show: false, 
    message: '', 
    variant: 'warning' 
  });

  useEffect(() => {
    const fetchArticles = async () => {
      const res = await fetch('/api/articles_with_tags');
      const data = await res.json();
      
      const normalized = (Array.isArray(data) ? data : [])
        .map((x: any) => {
          // Tags come as comma-separated string from the view
          const tagNames = x.tags ? x.tags.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
          
          return {
            id: Number(x.id),
            title: String(x.title || ''),
            excerpt: String(x.excerpt || ''),
            tags: tagNames,
            created: String(x.created || x.modified || '')
          };
        });
      
      setArticles(normalized);
      setFilteredArticles(normalized);
      
      // Extract unique tags
      const allTags = normalized.reduce((acc: string[], article) => {
        if (article.tags) {
          article.tags.forEach((tag: string) => {
            if (!acc.includes(tag)) {
              acc.push(tag);
            }
          });
        }
        return acc;
      }, []);
      setAvailableTags(allTags.sort());

      // Fetch likes and compute counts per article
      try {
        const likesRes = await fetch('/api/article_likes');
        const likesData = await likesRes.json();
        const counts: Record<number, number> = {};
        if (Array.isArray(likesData)) {
          for (const l of likesData) {
            const aId = Number(l.articleId);
            const c = l.likeCount != null ? Number(l.likeCount) : 1;
            counts[aId] = (counts[aId] || 0) + c;
          }
        }
        setLikesByArticleId(counts);
      } catch (_) {
        setLikesByArticleId({});
      }
    };

    fetchArticles().finally(() => setLoading(false));
  }, []);

  // Filter and sort articles
  useEffect(() => {
    let filtered = articles;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (article.tags && article.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }

    // Filter by selected tag
    if (selectedTag) {
      filtered = filtered.filter(article =>
        article.tags && article.tags.includes(selectedTag)
      );
    }

    // Sort articles
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created || '').getTime() - new Date(a.created || '').getTime();
        case 'oldest':
          return new Date(a.created || '').getTime() - new Date(b.created || '').getTime();
        case 'most-liked':
          const likesA = likesByArticleId[a.id] || 0;
          const likesB = likesByArticleId[b.id] || 0;
          return likesB - likesA;
        default:
          return 0;
      }
    });

    setFilteredArticles(filtered);
  }, [searchTerm, selectedTag, sortBy, articles, likesByArticleId]);

  const handleLike = async (articleId: number) => {
    if (!user) {
      setToast({ show: true, message: 'Please log in to like articles', variant: 'warning' });
      return;
    }
    if (likingIds[articleId]) return;
    setLikingIds(prev => ({ ...prev, [articleId]: true }));
    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, userId: user.id })
      });
      if (res.ok) {
        setLikesByArticleId(prev => ({ ...prev, [articleId]: (prev[articleId] ?? 0) + 1 }));
      } else {
      }
    } catch (_) {
    } finally {
      setLikingIds(prev => ({ ...prev, [articleId]: false }));
    }
  };

  return (
    <div className="page-content">
      <Container>
        <Row className="mb-4">
          <Col>
            <h2>All Articles</h2>
            <p>Browse our collection of hacking articles and tutorials.</p>
          </Col>
        </Row>

        {/* Search Bar */}
        <Row className="justify-content-center mb-4">
          <Col md={6}>
            <div className="search-container">
              <input 
                type="text" 
                className="form-control search-input" 
                placeholder="Search articles, tags, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="fas fa-search search-icon"></i>
            </div>
          </Col>
        </Row>

        {/* Main Content with Sidebar */}
        <Row>
          {/* Sidebar Filter */}
          <Col lg={3} className="mb-4">
            <div className="filter-sidebar">
              <h5 className="filter-title">Sort by</h5>
              <select 
                className="form-select tag-filter mb-3"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'most-liked')}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most-liked">Most Liked</option>
              </select>
              
              <h5 className="filter-title">Filter by Tag</h5>
              <select 
                className="form-select tag-filter"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                <option value="">All Tags</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
              {selectedTag && (
                <button 
                  className="btn btn-sm btn-outline-secondary mt-2"
                  onClick={() => setSelectedTag('')}
                >
                  Clear Filter
                </button>
              )}
            </div>
          </Col>

          {/* Articles List */}
          <Col lg={9}>
            {loading ? (
              <p className="text-muted">Loading articles...</p>
            ) : filteredArticles.length === 0 ? (
              <p className="text-muted">
                {searchTerm || selectedTag ? 
                  `No articles found${searchTerm ? ` for "${searchTerm}"` : ''}${selectedTag ? ` with tag "${selectedTag}"` : ''}` : 
                  'No articles available yet.'
                }
              </p>
            ) : (
              <Row className="gy-4">
                {filteredArticles.map((article) => (
                  <Col key={article.id} xs={12}>
                    <article className="horizontal-article-card">
                      <div className="horizontal-card-content">
                        <div className="horizontal-card-header">
                          <div className="horizontal-tags">
                            {(article.tags || []).map((tag, i) => (
                              <span key={i} className="horizontal-tag">{tag}</span>
                            ))}
                          </div>
                          <h3 className="horizontal-title">
                            <a href={`/articles/${article.id}`}>{article.title}</a>
                          </h3>
                        </div>
                        <div className="horizontal-card-body">
                          <p className="horizontal-excerpt">{article.excerpt}</p>
                          <div className="horizontal-card-footer">
                            <span className="horizontal-date">
                              {article.created ? new Date(article.created).toLocaleDateString() : ''}
                            </span>
                            <div className="likes-and-cta">
                              <button 
                                type="button"
                                className="likes-pill"
                                title={user ? 'Like' : 'Login to like'}
                                onClick={() => handleLike(article.id)}
                                disabled={!!likingIds[article.id]}
                                style={{ cursor: 'pointer' }}
                              >
                                <span className="material-symbols-outlined me-1 align-middle">thumb_up</span>
                                <span className="align-middle">{likesByArticleId[article.id] ?? 0}</span>
                              </button>
                              <a href={`/articles/${article.id}`} className="horizontal-read-more ms-2">Read More</a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>
      </Container>

      <Toast
        show={toast.show}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}
