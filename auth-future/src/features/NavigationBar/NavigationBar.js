//import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

import { Outlet } from 'react-router-dom';

import { Container, Row, Col, Button} from 'react-bootstrap';

export function NavigationBar() {
    return (
        <>
          <Navbar variant="dark" sticky="top" expand="lg" width="100%" style={{top: '0px', zIndex: '30', marginTop:' -49px', height: '50px', backgroundColor: '#111111'}}>
            <Container>
              <Navbar.Brand href="/" style={{display: 'flex'}}>AuthFuture</Navbar.Brand>
              <Nav className="me-auto" style={{justifyContent: 'end', flexDirection: 'row', display: 'flex', width: '100%'}}>
                  <Nav.Item>
                    <Nav.Link href="https://github.com/ethanm20/AuthFuture" target="_blank">
                      <Button variant="outline-light" style={{borderRadius: '25px'}}>
                        <i class="bi bi-github"></i> Source Code
                      </Button>
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link href="https://www.linkedin.com/in/ethan-marlow" target="_blank">
                      <i class="bi bi-moon"></i>
                    </Nav.Link>
                  </Nav.Item>
              </Nav>
            </Container>
          </Navbar>

          <Outlet/>
        </>
    )
}