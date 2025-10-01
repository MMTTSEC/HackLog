import { Container, Row, Col } from 'react-bootstrap';

MyArticles.route = {
  path: '/my-articles',
  menuLabel: 'My Articles',
  index: 5
}

export default function MyArticles() {
  return <div className="page-content">
    <Container>
      <Row>
        <Col>
          <h2>My Articles</h2>
          <p>Coming soon...</p>
        </Col>
      </Row>
    </Container>
  </div>
}
