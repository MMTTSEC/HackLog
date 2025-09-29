import { Container, Row, Col } from 'react-bootstrap';

Admin.route = {
  path: '/admin',
  menuLabel: 'Admin',
  index: 4
}

export default function Admin() {
  return <div className="page-content">
    <Container>
      <Row>
        <Col>
          <h2>Admin Panel</h2>
          
        </Col>
      </Row>
    </Container>
  </div>
}
