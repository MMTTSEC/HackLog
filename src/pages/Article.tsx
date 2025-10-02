import { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

Article.route = {
  path: '/articles/*'
}

type ArticleType = {
  id: number;
  title: string;
  content: string;
  created: string;
  modified: string;
  authorUsername?: string;
};

export default function Article() {
  const params = useParams();
  // When using a wildcard route (/articles/*), the matched remainder is stored under key "*"
  const wildcard = params['*'] || '';
  const articleId = (wildcard.split('/')[0] || '').trim();

  const [article, setArticle] = useState<ArticleType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!articleId) { setError('Missing article id.'); setLoading(false); return; }
      try {
        const res = await fetch(`/api/article_details/${articleId}`);
        const data = await res.json();
        if (data && !data.error) {
          setArticle({
            id: Number(data.id),
            title: String(data.title || ''),
            content: String(data.content || ''),
            created: String(data.created || ''),
            modified: String(data.modified || ''),
            authorUsername: data.authorUsername ? String(data.authorUsername) : undefined
          });
        } else {
          setError(String(data?.error || 'Not found'));
        }
      } catch (e: any) {
        setError('Failed to load article.');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [articleId]);

  return (
    <div className="page-content">
      <Container>
        <Row className="mb-4">
          <Col>
            {loading && <p className="text-muted">Loading article...</p>}
            {error && !loading && <p className="text-danger">{error}</p>}
            {!loading && !error && article && (
              <article>
                <h1 style={{ fontWeight: 800 }} className="mb-1">{article.title}</h1>
                {article.authorUsername && (
                  <div className="text-secondary mb-1">By {article.authorUsername}</div>
                )}
                <div className="mb-3 text-secondary">
                  <span>Created: {article.created ? new Date(article.created).toLocaleString() : ''}</span>
                  <span className="ms-3">Last modified: {article.modified ? new Date(article.modified).toLocaleString() : ''}</span>
                </div>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                  {article.content}
                </div>
              </article>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}


