import { useEffect, useRef, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import TextType from '../components/TextType';

Start.route = {
  path: '/',
  index: 1
}

type Article = {
  id: number;
  title: string;
  excerpt: string;
  tags?: string[];
  author?: string;
  created?: string;
};

export default function Start() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.5;
        heroRef.current.style.transform = `translateY(${parallax}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      const res = await fetch('/api/articles?featured=1');
      const data = await res.json();
      const normalized = (Array.isArray(data) ? data : [])
        .filter((x: any) => String(x.featured ?? '0') === '1')
        .map((x: any) => {
          const rawTags = x.tags ?? x.tagNames ?? [];
          let tagNames: string[] = [];
          if (Array.isArray(rawTags)) {
            tagNames = rawTags
              .map((t: any) => (typeof t === 'string' ? t : String(t?.name ?? '')))
              .filter(Boolean);
          } else if (typeof rawTags === 'string') {
            tagNames = rawTags.split(',').map((s: string) => s.trim()).filter(Boolean);
          }
          const author = x.authorUsername ?? x.username ?? x.author_name ?? x.authorName ?? x.author ?? '';
          return ({
            id: Number(x.id),
            title: String(x.title || ''),
            excerpt: String(x.excerpt || ''),
            tags: tagNames,
            author: String(author || ''),
            created: String(x.created || x.modified || '')
          });
        });
      setArticles(normalized);
    };

    fetchArticles().finally(() => setLoading(false));
  }, []);

  return (
    <div className="landing-page">
      {/* Hero Section with Parallax */}
      <section className="hero-section">
        <div 
          ref={heroRef}
          className="hero-background" 
          style={{ backgroundImage: 'url(/images/hero.gif)' }}
        />
        
        <div className="hero-overlay"></div>
        
        <div className="hero-content text-center text-white">
          <h1 className="display-4 mb-3">Welcome to HackLog</h1>
          <TextType 
            text={[
              "Your daily dose of cyber insight.",
              "Master the art of ethical hacking.",
              "Stay ahead of security threats.",
              "Learn, practice, and protect."
            ]}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="|"
            className="lead"
            variableSpeed={undefined}
            onSentenceComplete={undefined}
          />
        </div>
      </section>

      {/* Featured Blog Section */}
      <section className="blog-section">
        <Container>
          <Row className="mb-4">
            <Col md={10} lg={8}>
              
              <h2 className="display-5 mb-4">Here is our latest articles</h2>
            
            </Col>
          </Row>

          {loading ? (
            <p className="text-muted">Loading featured articles...</p>
          ) : articles.length === 0 ? (
            <p className="text-muted">No featured articles available yet.</p>
          ) : (
            <Row className="gy-4 gy-lg-0">
              {articles.map((a) => (
                <Col key={a.id} xs={12} lg={6}>
                  <article>
                    <Card className="border-0 h-100">
                      <Card.Body className="border bg-white p-4 d-flex flex-column">
                        <div className="entry-header mb-3">
                          <ul className="entry-meta list-unstyled d-flex mb-2 gap-2">
                            {(a.tags || []).map((tag, i) => (
                              <li key={i}>
                                <Badge bg="primary">{tag}</Badge>
                              </li>
                            ))}
                          </ul>
                          <h2 className="card-title entry-title h4 mb-0">
                            <a className="link-dark text-decoration-none" href={`/articles/${a.id}`}>{a.title}</a>
                          </h2>
                        </div>
                        <p className="card-text entry-summary text-secondary mb-3">{a.excerpt}</p>
                        <div className="mt-auto">
                          <Button variant="primary" className="text-nowrap" href={`/articles/${a.id}`}>Read More</Button>
                        </div>
                      </Card.Body>
                      <Card.Footer className="border border-top-0 bg-light p-4">
                        <ul className="entry-meta list-unstyled d-flex align-items-center m-0">
                          <li>
                            <span className="fs-7 text-secondary">
                              {a.created ? new Date(a.created).toLocaleDateString() : ''}
                            </span>
                          </li>
                          <li>
                          </li>
                          <li>
                            <span className="fs-7 text-secondary">{a.author || ''}</span>
                          </li>
                        </ul>
                      </Card.Footer>
                    </Card>
                  </article>
                </Col>
              ))}
            </Row>
          )}
          
          {!loading && articles.length > 0 && (
            <Row className="mt-4">
              <Col className="text-center">
                <Button variant="primary" size="lg" href="/articles">All Blog Posts</Button>
    </Col>
  </Row>
          )}
        </Container>
      </section>
    </div>
  );
}