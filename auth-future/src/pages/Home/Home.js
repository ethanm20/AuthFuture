import { NavigationBar } from "../../features/NavigationBar/NavigationBar";
import { TOTPTool } from "../TOTP-Tool/TOTP-Tool";
import { WebAuthnTool } from "../WebAuthn-Tool/WebAuthn-Tool";

import { Container, Row, Col, Button} from 'react-bootstrap';

//import { Flex, Text, Button } from "@radix-ui/themes";

export function Home() {

    function FeatureImage() {
        return (
            <>
                <div className="feature-image" style={{width: '100%', padding: 0, backgroundColor: '#111111'}}>
                    <Container style={{}}>
                        <Row className="align-items-center" style={{ height: '80vh' }}>
                            <Col md={6} className="text-white">
                                <h1 style={{fontSize: '60px', fontWeight: '700'}}>Learn about the <span style={{color: '#9b59b6'}}>future</span> of authentication.</h1>
                                {/* Call to Action Button */}
                                <Row> 
                                    <Col md={5}>
                                        <Button variant="light" size="lg" href="#cta-section" className="cta-button">
                                            WebAuthn Passkeys <i class="bi bi-arrow-right"></i>
                                        </Button>
                                    </Col>
                                    <Col md={7}>
                                        <Button variant="outline-light" size="lg" href="#cta-section" className="cta-button">
                                            Time-Based One Time Passwords <i class="bi bi-arrow-right"></i>
                                        </Button>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </>
        )
    }

    return (
        <>
            <div>
                <FeatureImage/>
            </div>
            <div>
                <WebAuthnTool/>
            </div>
            <div>
                <TOTPTool/>
            </div>
        </>
    )
}