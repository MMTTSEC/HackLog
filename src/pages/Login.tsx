import { Container, Row, Col } from 'react-bootstrap';

Login.route = {
  path: '/login',
  menuLabel: 'Login',
  index: 2
}

export default function Login() {
  return <div className="page-content">
    <Container>
      <Row>
        <Col>
          <h2>Login</h2>
          <p>Sign in to your HackLog account.</p>
        </Col>
      </Row>
    </Container>
  </div>
}
