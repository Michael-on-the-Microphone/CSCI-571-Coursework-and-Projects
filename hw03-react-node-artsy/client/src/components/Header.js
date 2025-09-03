import React, { useState, useRef, useEffect } from 'react';
import { Button, Navbar, Nav, Image, Container } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout, deleteAccount } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Function to check if a path is active
  const isActive = (path) => {
    if (path === '/') {
      // For home/search page, only match exact path or artist paths
      return location.pathname === '/' || location.pathname.startsWith('/artist/');
    }
    return location.pathname === path;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    // Close dropdown when ESC key is pressed
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/');
      setExpanded(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      const result = await deleteAccount();
      if (result.success) {
        navigate('/');
        setExpanded(false);
      }
    }
  };

  const handleNavLinkClick = () => {
    setExpanded(false);
  };

  return (
    <Navbar
      bg="light"
      expand="md"
      className="px-2 py-2"
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="text-dark">
          <h5 className="mb-0">Artist Search</h5>
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          style={{ minWidth: '44px', minHeight: '44px' }}
        />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link
              as={Link}
              to="/"
              className={`my-2 my-md-0 px-3 py-2 rounded ${isActive('/') ? 'bg-primary text-white' : 'text-dark'}`}
              onClick={handleNavLinkClick}
            >
              Search
            </Nav.Link>

            {user ? (
              <>
                <Nav.Link
                  as={Link}
                  to="/favorites"
                  className={`my-2 my-md-0 px-3 py-2 rounded ${isActive('/favorites') ? 'bg-primary text-white' : 'text-dark'}`}
                  onClick={handleNavLinkClick}
                >
                  Favorites
                </Nav.Link>

                <div className="position-relative d-md-block d-flex" ref={dropdownRef}>
                  <div
                    className="d-flex align-items-center p-2 rounded cursor-pointer my-2 my-md-0"
                    style={{ cursor: 'pointer', minHeight: '44px' }}
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <Image
                      src={user.profileImageUrl}
                      roundedCircle
                      width="30"
                      height="30"
                      className="me-2"
                    />
                    <span className="me-1">{user.fullname}</span>
                    <i className="bi bi-caret-down-fill"></i>
                  </div>

                  {showDropdown && (
                    <div className="position-absolute end-0 mt-2 py-2 bg-white rounded shadow-sm"
                         style={{ width: '200px', zIndex: 1000 }}>
                      <Button
                        variant="link"
                        className="dropdown-item text-danger"
                        onClick={handleDeleteAccount}
                        style={{ minHeight: '44px' }}
                      >
                        Delete account
                      </Button>
                      <Button
                        variant="link"
                        className="dropdown-item"
                        onClick={handleLogout}
                        style={{ minHeight: '44px' }}
                      >
                        Log out
                      </Button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Nav.Link
                  as={Link}
                  to="/login"
                  className={`my-2 my-md-0 px-3 py-2 rounded ${isActive('/login') ? 'bg-primary text-white' : 'text-dark'}`}
                  onClick={handleNavLinkClick}
                >
                  Log in
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/register"
                  className={`my-2 my-md-0 px-3 py-2 rounded ${isActive('/register') ? 'bg-primary text-white' : 'text-dark'}`}
                  onClick={handleNavLinkClick}
                >
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;