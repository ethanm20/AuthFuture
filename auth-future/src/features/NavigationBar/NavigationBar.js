import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

import { Outlet } from 'react-router-dom';

export function NavigationBar() {
    return (
        <>
          <Navbar bg="light" data-bs-theme="light" className="bg-body-tertiary" width="100%">
            <Container>
              <Navbar.Brand href="/">AuthFuture</Navbar.Brand>
              <Nav className="me-auto">
                <Nav.Link href="/">Home</Nav.Link>
                <NavDropdown title="Authentication Methods" id="basic-nav-dropdown">
                  <NavDropdown.Item href="/password-authentication">Passwords</NavDropdown.Item>
                  <NavDropdown.Item href="/webauthn-description">WebAuthn</NavDropdown.Item>
                  <NavDropdown.Item href="/totp">TOTP</NavDropdown.Item>
                  <NavDropdown.Item href="/tokens">Tokens</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="/history">History</NavDropdown.Item>
                </NavDropdown>
                <NavDropdown title="Tools" id="basic-nav-dropdown">
                  <NavDropdown.Item href="/totp-tool">TOTP 2FA</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="/webauthn-tool">WebAuthn</NavDropdown.Item>
                </NavDropdown>
                <Nav.Link href="#link">Link</Nav.Link>
              </Nav>
            </Container>
          </Navbar>

          <Outlet/>
        </>
    )
}