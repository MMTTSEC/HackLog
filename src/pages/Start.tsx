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
      const res = await fetch('/api/articles_with_tags?featured=1');
      const data = await res.json();
      
      // Debug: Log the raw API response
      console.log('Raw API response:', data);
      
      const normalized = (Array.isArray(data) ? data : [])
        .filter((x: any) => String(x.featured ?? '0') === '1')
        .map((x: any) => {
          // Debug: Log each article object
          console.log('Processing article:', x);
          
          // Tags come as comma-separated string from the view
          const tagNames = x.tags ? x.tags.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
          
          const processed = {
            id: Number(x.id),
            title: String(x.title || ''),
            excerpt: String(x.excerpt || ''),
            tags: tagNames,
            created: String(x.created || x.modified || '')
          };
          
          // Debug: Log the processed article
          console.log('Processed article:', processed);
          
          return processed;
        });
      
      // Debug: Log final normalized data
      console.log('Final normalized articles:', normalized);
      
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
            <Row className="gy-5">
              {articles.map((a) => (
                <Col key={a.id} xs={12} lg={6}>
                  <article className="custom-article-card h-100">
                    <div className="custom-article-header">
                      <div className="custom-tags">
                        {(a.tags || []).map((tag, i) => (
                          <span key={i} className="custom-tag">{tag}</span>
                        ))}
                      </div>
                      <h2 className="custom-title">
                        <a href={`/articles/${a.id}`}>{a.title}</a>
                      </h2>
                    </div>
                    <div className="custom-article-body">
                      <p className="custom-excerpt">{a.excerpt}</p>
                      <a href={`/articles/${a.id}`} className="custom-read-more">Read More</a>
                    </div>
                    <div className="custom-article-footer">
                      <div className="custom-meta">
                        <span className="custom-date">
                          {a.created ? new Date(a.created).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>
                  </article>
                </Col>
              ))}
            </Row>
          )}
          
          {!loading && articles.length > 0 && (
            <Row className="mt-4">
              <Col className="text-center">
                <a href="/articles" className="custom-read-more">All Articles</a>
    </Col>
  </Row>
          )}
        </Container>
      </section>
    </div>
  );
}