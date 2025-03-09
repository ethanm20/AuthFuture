import { Button } from "react-bootstrap";
import { NavigationBar } from "../../features/NavigationBar/NavigationBar";

import { useState } from 'react';

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
            <span><i>You have no registered passkeys. Add a new passkey below.</i></span>
            </>
        )
    }

    function renderPasskeyRegisterTabPage1() {
        return (
            <>

                <h4>Step 1: Generating Passkey From Browser</h4>

                <span>Challenge: {unverifiedCredential['challenge']}</span>

                <span>Options provided to browser in navigate.credentials.create()</span>

                <code>
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

                </code>

                <Button variant="success">Register</Button>
            </>
        )
    }

    function passkeyTabTitle() {
        return (
            <>
                <div id="passkey-tab-title"><h4>Create New Passkey</h4></div>
            </>
        )
    }

    function renderPasskeyRegisterTab() {
        if (registerNewPasskeyTab === 1) {
            return (
                <>
                    {passkeyTabTitle()}
                    {renderPasskeyRegisterTabPage1()}
                </>
            )
        } 
    }

    return (
        <>
        <link rel="stylesheet" href="/css/webauthn-tool.css"></link>

        <h2>WebAuthn Tool</h2>

        <p>Interactive tool to test and understand the FIDO2 WebAuthn passkey protocol. For your privacy all processing is performed on the frontend and credentials are temporarily saved in your browser cache.</p>
        <div id="webauthn-tool-container">
            

            <div id="webauthn-register">
                <h3>Part 1: Register Passkeys</h3>

                <div id>
                    <span>Here are your registered passkeys:</span>
                    <div id="passkey-list">
                        {renderListRegisteredPasskeys()}
                    </div>
                    <div id="passkey-register-tab">
                        {renderPasskeyRegisterTab()}
                    </div>
                    {(() => {
                        if (registerNewPasskeyTab) {
                            return (
                                <Button variant="danger" onClick={toggleRegisterNewPasskeyTab}>Cancel</Button>
                            )
                        } else {
                            return (
                                <Button variant="primary" onClick={toggleRegisterNewPasskeyTab}>Add New Passkey</Button>
                            )
                        }
                    })()}
                </div>

                
            </div>
            <div id="webauthn-login">
                <h3>Part 2: Login with Passkey</h3>

                {renderPasskeyLoginTab()}
                
                {(() => {
                    if (loginWithPasskeyTab) {
                        return (
                        <Button onClick={togglePasskeyLoginTab} variant="danger">Cancel</Button>
                        )
                    } else {
                        return (
                        <Button onClick={togglePasskeyLoginTab} variant="primary">Start</Button>
                        )
                    }
                })()}
            </div>
        </div>
        </>
    );
}