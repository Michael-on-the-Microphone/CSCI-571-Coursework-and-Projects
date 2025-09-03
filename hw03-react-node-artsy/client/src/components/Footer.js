import React from 'react';
import { Container, Image } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-2 fixed-bottom d-flex align-items-center" style={{ height: '40px', zIndex: 1000, width: '100%' }}>
      <Container className="text-center">
        <div className="d-flex justify-content-center align-items-center h-100">
          <small className="d-flex align-items-center m-0 p-0">
            Powered by
            <a href="https://www.artsy.net/" className="text-white text-decoration-none d-flex align-items-center ms-1" style={{ color: 'white !important', textDecoration: 'none !important' }}>
              <Image
                src="/artsy_logo.svg"
                alt="Artsy Logo"
                width="20"
                height="20"
                className="mx-1"
              />
              <span className="text-white" style={{ color: 'white !important' }}>Artsy</span>
            </a>
          </small>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;