//import { Button } from "react-bootstrap";
import { NavigationBar } from "../../features/NavigationBar/NavigationBar";

import {Button, Container, Modal} from 'react-bootstrap';

import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import "highlight.js/styles/monokai.css";

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight, vscDarkPlus, dark, coldarkDark, materialDark, duotoneDark, oneDark} from 'react-syntax-highlighter/dist/esm/styles/prism';



import { useState, useRef, useEffect } from 'react';


hljs.registerLanguage("javascript", javascript);

export function WebAuthnTool() {
    const [registerNewPasskeyTab, setRegisterNewPasskeyTab] = useState(0)

    const [loginWithPasskeyTab, setLoginWithPasskeyTab] = useState(0)

    const [unverifiedCredential, setUnverifiedCredential] = useState({
        challenge: 'ranDomChaLLenge'
    })

    function toggleRegisterNewPasskeyTab() {
        if (registerNewPasskeyTab === 0) {
            setRegisterNewPasskeyTab((registerNewPasskeyTab) => 1)
        } else {
            setRegisterNewPasskeyTab((registerNewPasskeyTab) => 0)
        }
    }

    function togglePasskeyLoginTab() {
        setLoginWithPasskeyTab((loginWithPasskeyTab) => !loginWithPasskeyTab)
    }

    function renderPasskeyLoginTab() {
        if (loginWithPasskeyTab) {
            return (
                <>
                    <h4>Step 1: Obtaining Passkey Signature from Browser</h4>
                    <span>Settings browser provided with in navigator.credentials.get()</span>
                </>
            )
        } 
    }

    function renderListRegisteredPasskeys() {
        return (
            <>
            <div style={{border: '1px solid #000', borderStyle: 'dashed', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '50px', paddingBottom: '50px'}}><span>No registered passkeys.</span></div>
            </>
        )
    }
    //const codeRef = useRef(null);
    function RenderPasskeyRegisterTabPage1() {
        /*const codeRef = useRef(null);

        useEffect(() => {
            hljs.highlightBlock(codeRef.current);
        }, []);*/

        /*useEffect(() => {
            hljs.highlightBlock(codeRef.current);
          }, []);*/
        
        return (
            <>

                <h4>Step 1: Generating Passkey From Browser</h4>

                <p>Challenge: {unverifiedCredential['challenge']}</p>

                <span>Options provided to browser in navigate.credentials.create()</span>
                <pre>
                    <SyntaxHighlighter language="javascript" style={coldarkDark}>
                        {`
                        navigator.credentials.create(
                            "publicKey": 
                                "challenge": getNewUnverifiedBiometricChallenge(email),
                                "rp": (
                                    "id": "localhost", 
                                    "name": "SECUREAuth" 
                                ),
                                "user": (
                                    "id": getUserID(email),
                                    "name": email,
                                    "displayName": getUserFullName(email)
                                ),
                                "pubKeyCredParams": [ 
                                    "type": "public-key",
                                    "alg": -7,
                                    "type": "public-key",
                                    "alg": -257
                                ],
                                "authenticatorSelection": 
                                    "authenticatorAttachment": "platform",
                                    "userVerification": "preferred",
                                    "requireResidentKey": True
                                ,
                                "excludeCredentials": excludeCredentials
                            

                        )
                        `}    
                    </SyntaxHighlighter>
                </pre>
                <Button variant="danger" onClick={toggleRegisterNewPasskeyTab}>Cancel</Button> <Button variant="success">Register</Button>
            </>
        )
    }

    function passkeyTabTitle() {
        return (
            <>
                <div id="passkey-tab-title" style={{color: '#FFF', backgroundColor: '#2a2a2a'}}><h4>Create New Passkey</h4></div>
            </>
        )
    }

    function renderPasskeyRegisterTab() {
        if (registerNewPasskeyTab === 1) {
            return (
                <>
                    {passkeyTabTitle()}
                    {RenderPasskeyRegisterTabPage1()}
                </>
            )
        } 
    }

    return (
        <>
        <section style={{backgroundColor: '#f1f1f1', color: '#000', paddingTop: '10px', paddingBottom: '30px'}}>
            <Container>
                <link rel="stylesheet" href="/css/webauthn-tool.css"></link>

                <h2>WebAuthn Passkeys</h2>

                <div id="webauthn-tool-container" style={{border: '1px solid #000'}}>
                    

                    <div id="webauthn-register" style={{borderBottom: '1px solid #000'}}>
                        <h3><i class="bi bi-sliders"></i> Configure Passkeys</h3>

                        <div id>
                            <div id="passkey-list" style={{paddingBottom: '20px'}}>
                                {renderListRegisteredPasskeys()}
                            </div>
                            <div id="passkey-register-tab" style={{border: '2px solid #000', backgroundColor: 'transparent'}}>
                                {renderPasskeyRegisterTab()}
                            </div>
                            {(() => {
                                if (registerNewPasskeyTab) {
                                    return (
                                        <>
                                        </>
                                    )
                                } else {
                                    return (
                                        <Button variant="dark" onClick={toggleRegisterNewPasskeyTab}>Add New Passkey</Button>
                                    )
                                }
                            })()}
                        </div>

                        
                    </div>
                    <div id="webauthn-login">
                        <h3>Login with Passkey</h3>

                        {renderPasskeyLoginTab()}
                        
                        {(() => {
                            if (loginWithPasskeyTab) {
                                return (
                                <Button onClick={togglePasskeyLoginTab} variant="danger">Cancel</Button>
                                )
                            } else {
                                return (
                                <Button onClick={togglePasskeyLoginTab} variant="dark">Start</Button>
                                )
                            }
                        })()}
                    </div>
                </div>
            </Container>
        </section>
        </>
    );
}