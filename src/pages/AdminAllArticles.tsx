import { Container, Row, Col } from 'react-bootstrap';
import ProtectedRoute from '../utils/ProtectedRoute';

AdminAllArticles.route = {
  path: '/admin/articles',
  menuLabel: 'All Articles',
  index: 7,
  parent: '/admin'
}

export default function AdminAllArticles() {
  return <ProtectedRoute roles={['admin']}>
    <div className="page-content">
      <Container>
        <Row>
          <Col>
            <h2>All Articles (Admin)</h2>
            <p>Coming soon...</p>
          </Col>
        </Row>
      </Container>
    </div>
  </ProtectedRoute>
}
