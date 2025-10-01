import { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

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
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);

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
          article.tags.forEach(tag => {
            if (!acc.includes(tag)) {
              acc.push(tag);
            }
          });
        }
        return acc;
      }, []);
      setAvailableTags(allTags.sort());
    };

    fetchArticles().finally(() => setLoading(false));
  }, []);

  // Filter articles based on search term and selected tag
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

    setFilteredArticles(filtered);
  }, [searchTerm, selectedTag, articles]);

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
                            <a href={`/articles/${article.id}`} className="horizontal-read-more">Read More</a>
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
    </div>
  );
}
