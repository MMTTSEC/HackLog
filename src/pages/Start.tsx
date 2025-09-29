import { useEffect, useRef } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import TextType from '../components/TextType';

Start.route = {
  path: '/',
  index: 1
}

export default function Start() {
  const heroRef = useRef<HTMLDivElement>(null);

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

      {/* Blog Section */}
      <section className="blog-section">
        <Container>
          <Row>
            <Col className="text-center">
              <h2 className="display-3 mb-4">Here are some of our blogs</h2>
              <p className="lead text-muted">Coming soon...</p>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
}