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
  const wildcard = params['*'] || '';
  const articleId = (wildcard.split('/')[0] || '').trim();

  const [article, setArticle] = useState<ArticleType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likesCount, setLikesCount] = useState<number>(0);

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
        // Fetch like count for this article
        try {
          const likesRes = await fetch(`/api/article_likes?where=articleId=${encodeURIComponent(articleId)}`);
          const likesData = await likesRes.json();
          if (Array.isArray(likesData) && likesData.length > 0) {
            setLikesCount(Number(likesData[0].likeCount || 0));
          } else {
            setLikesCount(0);
          }
        } catch (_) { setLikesCount(0); }
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
        <Row className="justify-content-center">
          <Col lg={10} xl={8}>
            {loading && <p className="text-muted">Loading article...</p>}
            {error && !loading && <p className="text-danger">{error}</p>}
            {!loading && !error && article && (
              <article className="article-detail">
                <h1 className="article-title display-4 fw-bold mb-2">{article.title}</h1>
                {article.authorUsername && (
                  <div className="article-author mb-2">By {article.authorUsername}</div>
                )}
                <hr className="article-divider" />
                <div className="article-content mb-4" style={{ whiteSpace: 'pre-wrap' }}>
                  {article.content}
                </div>
                <div className="article-info d-flex align-items-center gap-3">
                  <span className="article-likes d-inline-flex align-items-center">
                    <span className="material-symbols-outlined me-1">thumb_up</span>
                    {likesCount}
                  </span>
                  <span>Created: {article.created ? new Date(article.created).toLocaleString() : ''}</span>
                  <span>Updated: {article.modified ? new Date(article.modified).toLocaleString() : ''}</span>
                </div>
              </article>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}


