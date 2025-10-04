import { Container, Row, Col } from 'react-bootstrap';

export default function Footer() {
  return <footer className="footer mt-auto">
    <Container className="footer-content">
      <Row className="py-4">
        <Col md={6} className="mb-3 mb-md-0">
          <h5 className="footer-heading">HackLog</h5>
          <p className="footer-text">
            Your trusted platform for sharing and discovering technical articles, tutorials, and insights.
          </p>
        </Col>
        <Col md={6} className="mb-3 mb-md-0">
          <h5 className="footer-heading">Quick Links</h5>
          <ul className="footer-links">
            <li><a href="/">Home</a></li>
            <li><a href="/articles">Articles</a></li>
            <li><a href="/login">Login</a></li>
            <li><a href="/register">Register</a></li>
          </ul>
        </Col>
      </Row>
      <Row>
        <Col className="text-center py-3 footer-bottom">
          <p className="mb-0">© HackLog {new Date().getFullYear()} - All rights reserved</p>
        </Col>
      </Row>
    </Container>
  </footer>;
}