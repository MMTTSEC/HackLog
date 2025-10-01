import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Container, Nav, Navbar } from 'react-bootstrap';
import routes from '../routes';
import { NavDropdown } from 'react-bootstrap';

export default function Header() {

  // whether the navbar is expanded or not
  // (we use this to close it after a click/selection)
  const [expanded, setExpanded] = useState(false);

  //  get the current route
  const pathName = useLocation().pathname;
  const currentRoute = routes
    .slice().sort((a, b) => a.path.length > b.path.length ? -1 : 1)
    .find(x => pathName.indexOf(x.path.split(':')[0]) === 0);
  // function that returns true if a menu item is 'active'
  const isActive = (path: string) =>
    path === currentRoute?.path || path === currentRoute?.parent;

  return <header>
    <Navbar
      expanded={expanded}
      expand="md"
      data-bs-theme="dark"
      fixed="top"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(5px)',
      }}
    >
      <Container fluid>
        <div className="d-flex w-100 justify-content-between align-items-center">
          <Navbar.Brand as={Link} to="/">
            HackLog
          </Navbar.Brand>
          <Navbar.Toggle onClick={() => setExpanded(!expanded)} />
        </div>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="w-100 justify-content-center">
            {routes.filter(x => x.menuLabel && !x.parent).map(({ menuLabel, path }, i) => {
              // Group admin children under a dropdown
              if (path === '/admin') {
                const adminChildren = routes.filter(r => r.parent === '/admin' && r.menuLabel);
                const adminActive = isActive('/admin') || adminChildren.some(child => isActive(child.path));
                return (
                  <NavDropdown
                    title={menuLabel}
                    key={`admin-${i}`}
                    className={adminActive ? 'active' : ''}
                    onClick={() => setTimeout(() => setExpanded(false), 200)}
                  >
                    {adminChildren.map((child, j) => (
                      <NavDropdown.Item
                        as={Link}
                        to={child.path}
                        key={`admin-child-${j}`}
                        className={isActive(child.path) ? 'active' : ''}
                        onClick={() => setTimeout(() => setExpanded(false), 200)}
                      >
                        {child.menuLabel}
                      </NavDropdown.Item>
                    ))}
                  </NavDropdown>
                );
              }
              // Render regular top-level links
              return (
                <Nav.Link
                  as={Link}
                  key={i}
                  to={path}
                  className={isActive(path) ? 'active' : ''}
                  onClick={() => setTimeout(() => setExpanded(false), 200)}
                >
                  {menuLabel}
                </Nav.Link>
              );
            })}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  </header>;
}