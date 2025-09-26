import { Row, Col } from 'react-bootstrap';

Start.route = {
  path: '/',
  index: 1
}

export default function Start() {
  return <div className="hero-section" style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundImage: 'url(/images/hero.gif)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1
  }}>
    {/* Black overlay */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.6)', // Black overlay with 50% opacity
      zIndex: 0
    }}></div>
    
    <div className="hero-content text-center text-white" style={{
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: '2rem',
      borderRadius: '10px',
      zIndex: 1
    }}>
      <h1 className="display-4 mb-3">Welcome to HackLog</h1>
      <p className="lead">Your ultimate hacking journey starts here</p>
    </div>
  </div>
}