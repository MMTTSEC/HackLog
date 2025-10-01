import { Container, Row, Col } from 'react-bootstrap';

AllUsers.route = {
  path: '/admin/users',
  menuLabel: 'All Users',
  index: 6,
  parent: '/admin'
}

export default function AllUsers() {
  return <div className="page-content">
    <Container>
      <Row>
        <Col>
          <h2>All Users</h2>
          <p>Coming soon...</p>
        </Col>
      </Row>
    </Container>
  </div>
}
