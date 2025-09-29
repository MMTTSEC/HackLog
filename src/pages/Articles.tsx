import { Container, Row, Col } from 'react-bootstrap';

Articles.route = {
  path: '/articles',
  menuLabel: 'Articles',
  index: 3
}

export default function Articles() {
  return <div className="page-content">
    <Container>
      <Row>
        <Col>
          <h2>Articles</h2>
          <p>Browse our collection of hacking articles and tutorials.</p>
        </Col>
      </Row>
    </Container>
  </div>
}
