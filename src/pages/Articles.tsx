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
    };

    fetchArticles().finally(() => setLoading(false));
  }, []);

  // Filter articles based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredArticles(articles);
    } else {
      const filtered = articles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (article.tags && article.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
      setFilteredArticles(filtered);
    }
  }, [searchTerm, articles]);

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

        {loading ? (
          <p className="text-muted">Loading articles...</p>
        ) : filteredArticles.length === 0 ? (
          <p className="text-muted">
            {searchTerm ? `No articles found for "${searchTerm}"` : 'No articles available yet.'}
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
      </Container>
    </div>
  );
}
