//import { Button } from "react-bootstrap";


import { NavigationBar } from "../../features/NavigationBar/NavigationBar";

import {Button, Container, Modal, ButtonGroup} from 'react-bootstrap';

import ReactFlow, { ReactFlowProvider, Handle, Position }  from 'reactflow';

import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import "highlight.js/styles/monokai.css";

import sha256 from 'crypto-js/sha256';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight, vscDarkPlus, dark, coldarkDark, materialDark, duotoneDark, oneDark} from 'react-syntax-highlighter/dist/esm/styles/prism';



import { useState, useRef, useEffect } from 'react';

import { GenerateBase32SecretKey } from "./utilities/generate-base-32-key";

import { arrayBufferToBase64 } from "./utilities/base64";

import Accordion from 'react-bootstrap/Accordion';
import { Base64Binary, GenerateBase64SecretKey } from "./utilities/base64";




import { Buffer } from 'buffer';

import 'reactflow/dist/style.css';

//const { importSPKI, exportJWK } = require('jose');

const CryptoJS = require("crypto-js");



//var ecdsa = require('ecdsa')



hljs.registerLanguage("javascript", javascript);

export function WebAuthnTool() {
    const [registerNewPasskeyTab, setRegisterNewPasskeyTab] = useState(0)

    const [loginWithPasskeyTab, setLoginWithPasskeyTab] = useState(0)

    const [unverifiedCredential, setUnverifiedCredential] = useState({
        challenge: GenerateBase32SecretKey()
    })

    const [challenge, setChallenge] = useState(GenerateBase64SecretKey())

    const [fullname, setFullname] = useState("John Smith")

    const [username, setUsername] = useState("Username")


    const [currCredID, setCurrCredID] = useState("")
    const [currPublicKey, setCurrPublicKey] = useState("")
    const [currAlg, setCurrAlg] = useState(0)
    const [currJSON, setCurrJSON] = useState("")
    const [currTransports, setCurrTransports] = useState("")


    const [savedCredentials, setSavedCredentials] = useState([])

    const [passwordlessMode, setPasswordlessMode] = useState(false)

    

    const [verifyPasskeyTab, setVerifyPasskeyTab] = useState(0)


    const [passkeyDiagramTab, setPasskeyDiagramTab] = useState(0)


    const [assertionData, setAssertionData] = useState({
        "id": "",
        "authenticatorData": "",
        "clientDataJSON": "",
        "signature": "",
        "userHandle": ""
    })


    const [validationCalculations, setValidationCalculations] = useState({
        'id': '',
        'clientDataJSON': '',
        'hmac-sha256': '',
        'authenticatorJSONCombined': ''
    })


    function toggleRegisterNewPasskeyTab() {
        if (registerNewPasskeyTab === 0) {
            setRegisterNewPasskeyTab((registerNewPasskeyTab) => 1)
        } else {
            setRegisterNewPasskeyTab((registerNewPasskeyTab) => 0)
        }
    }

    function togglePasskeyLoginTab() {
        //setLoginWithPasskeyTab((loginWithPasskeyTab) => !loginWithPasskeyTab)
        if (loginWithPasskeyTab === 0) {
            setLoginWithPasskeyTab((loginWithPasskeyTab) => 1)
        } else {
            setLoginWithPasskeyTab((loginWithPasskeyTab) => 0)
        }
    }

    

    function registerPasskey() {
        navigator.credentials.create({
            "publicKey": {
                "challenge": Base64Binary.decode(challenge),
                "rp": {
                    "id": window.location.hostname, 
                    "name": "AuthFuture"
                },
                "user": {
                    "id": Uint8Array.from('user-id-1234', c => c.charCodeAt(0)),
                    "name": username,
                    "displayName": fullname
                },
                "pubKeyCredParams": [ 
                    {
                        "type": "public-key",
                        "alg": -7,
                    },
                    {
                        "type": "public-key",
                        "alg": -257
                    }
                ],
                "authenticatorSelection": {
                    "userVerification": "preferred",
                    "requireResidentKey": false
                },
                "excludeCredentials": getCredentialArray()
            }
        })
        .then((response) => {
            console.log('Returned')
            console.log(response)

            const decoder = new TextDecoder("utf-8");

            setCurrCredID(arrayBufferToBase64(response.rawId))
            setCurrPublicKey(arrayBufferToBase64(response.response.getPublicKey()))
            setCurrAlg(response.response.getPublicKeyAlgorithm())
            setCurrJSON(decoder.decode(response.response.clientDataJSON))
            setCurrTransports(response.response.getTransports())

            setRegisterNewPasskeyTab(2)
        })
    }

    function finishPasskeyRegistration() {
        let newCredential = {
            'idNum': savedCredentials.length,
            'id': currCredID,
            'publicKey': currPublicKey,
            'clientDataJSON': currJSON,
            'alg': currAlg,
            'transports': currTransports
        }

        let newCredentialsList = []
        savedCredentials.forEach((item) => {
            newCredentialsList.push(item)
        })
        newCredentialsList.push(newCredential)

        setSavedCredentials(newCredentialsList)

        setRegisterNewPasskeyTab(0)

        console.log('Saved Creds')
        console.log(savedCredentials)
    }

    function renderPasskeys() {
        console.log(savedCredentials)
        console.log(typeof savedCredentials)
        return (
            savedCredentials.map((item) => (
                <>
                    <Accordion.Item class="webauthn-item" id={"webauthn-id" + item.idNum} eventKey={item.idNum} style={{width: '100%'}}>
                        <Accordion.Header><span>Passkey #{item.idNum}     <i>(ID: {item.id})</i> </span></Accordion.Header>
                        <Accordion.Body style={{textWrap: 'wrap', textWrapStyle: 'pretty', overflowWrap:'break-word'}}>
                            <span><b>Credential ID: </b> {item.id}</span><br/>

                            <span><b>Public Key (Base 64): </b> </span><br/>

                            <div style={{textWrap: 'wrap', textWrapStyle: 'pretty', overflowWrap:'break-word'}}>
                                <p style={{textWrap: 'wrap', textWrapStyle: 'pretty', overflowWrap:'break-word'}}>{item.publicKey}</p>
                            </div>

                            <span><b>Algorithm:</b> {item.alg}</span><br/>

                            <span><b>Transports: </b> {item.transports}</span><br/>

                            {(item.transports == 'internal') ? <div className="alert alert-success" role="alert">Passkey may be used in passwordless mode</div> : <div className="alert alert-danger" role="alert"><b>External Authenticator:</b> Unable to be used in passwordless mode</div>}


                        </Accordion.Body>
                    </Accordion.Item>
                </>
            ))
        )
    }

    function renderListRegisteredPasskeys() {
        if (savedCredentials.length == 0) {
            return (
                <>
                    <div style={{border: '1px solid #000', borderStyle: 'dashed', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '50px', paddingBottom: '50px'}}>
                        <span>No registered passkeys.</span>
                    </div>
                </>
            )
        } else {
            return (
                <>
                    <div style={{border: '1px solid #000', borderStyle: 'dashed', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '50px', paddingBottom: '50px'}}>
                        <Accordion style={{maxWidth:'100%', width:'100%'}}>
                            {renderPasskeys()}
                        </Accordion>
                    </div>
                </>
            )
        }
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

                <p><b>Challenge: </b>{challenge} <Button variant="dark" onClick={(event) => {setChallenge(GenerateBase64SecretKey())}}><i class="bi bi-arrow-repeat"></i></Button></p>

                <form>
                    <div>
                        <b>Display Name: </b><input type="text" value={fullname} onChange={(event) => {setFullname(event.target.value)}}></input>
                    </div>
                    <div>
                        <b>Username: </b><input type="text" value={username} onChange={(event) => {setUsername(event.target.value)}}></input>
                    </div>
                </form>

                <span>Options provided to browser in navigate.credentials.create()</span>
                <pre>
                    <SyntaxHighlighter language="javascript" style={coldarkDark}>
                        {`
                        navigator.credentials.create(
                            "publicKey": {
                                "challenge": Uint8Array.from("${challenge}"),
                                "rp": {
                                    "id": "authfuture.com", 
                                    "name": "AuthFuture"
                                },
                                "user": {
                                    "id": 1,
                                    "name": "${username}",
                                    "displayName": "${fullname}"
                                },
                                "pubKeyCredParams": [ 
                                    {
                                        "type": "public-key",
                                        "alg": -7,
                                    },
                                    {
                                        "type": "public-key",
                                        "alg": -257
                                    }
                                ],
                                "authenticatorSelection": {
                                    "userVerification": "preferred",
                                    "requireResidentKey": false
                                },
                                "excludeCredentials": ${getCredentialArrayStr()}
                            }
                        )
                        `}    
                    </SyntaxHighlighter>
                </pre>
                <Button variant="danger" onClick={toggleRegisterNewPasskeyTab}>Cancel</Button> <Button variant="success" onClick={(event) => {registerPasskey()}}>Register</Button>
            </>
        )
    }

    function RenderPasskeyRegisterTabPage2() {
        return (
            <>
                <h2>Step 2: Store Attestation Response</h2>

                <span>The following Attestation Response is returned from the navigator.credentials.create() function.</span><br/>

                <pre>
                    <SyntaxHighlighter language="javascript" style={coldarkDark}>
                        {`
                        PublicKeyCredential {
                            id: "${currCredID}"
                            type: "public-key"
                            authenticatorAttachment: "platform"
                            response: AuthenticatorAttestationResponse {
                                AttestationObject: ArrayBuffer()
                                ClientDataJSON: ArrayBuffer()
                                getClientDataJSON()
                                getPublicKeyAlgorithm()
                                getAlgorithm()
                                getTransports()
                            }
                        }
                        `}

                    </SyntaxHighlighter>
                </pre>

                <span><b>Credential ID: </b> {currCredID}</span><br/>

                <span><b>Public Key (Base 64): </b> {currPublicKey}</span><br/>

                <span><b>Algorithm:</b> {currAlg}</span><br/>

                <span><b>Transports: </b> {currTransports}</span><br/>

                <span><b>Client Data JSON:</b> </span><br/>

                <pre>
                    <SyntaxHighlighter language="javascript" style={coldarkDark}>
                        {currJSON}
                    </SyntaxHighlighter>
                </pre>

                <div style={{backgroundColor: 'green', border: '1px solid green', borderRadius: '20px', color: '#FFF', display: 'flex', flexDirection: 'row'}}>
                    <div style={{width: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <i class="bi bi-check-circle-fill"></i>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <span><h3>Challenge Verified</h3></span>
                        <span><b>Challenge:</b> {challenge}</span>
                        <span>Set challenge matches challenge returned in Client Data JSON</span>
                    </div>
                </div>

                <Button variant="danger" onClick={toggleRegisterNewPasskeyTab}>Cancel</Button> <Button variant="success" onClick={(event) => {finishPasskeyRegistration()}}>Finish</Button>
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
        } else if (registerNewPasskeyTab === 2) {
            return (
                <>
                    {passkeyTabTitle()}
                    {RenderPasskeyRegisterTabPage2()}
                </>
            )
        } 
    }

    // --------------------------------------------------------------------------------------------------
    /* Verify Passkey */



    async function verifyES256(publicKeyRaw, signatureRaw, authenticatorDataJSONRaw) {
        //Process Signature
        var usignature = new Uint8Array(signatureRaw);
        var rStart = usignature[4] === 0 ? 5 : 4;
        var rEnd = rStart + 32;
        var sStart = usignature[rEnd + 2] === 0 ? rEnd + 3 : rEnd + 2;
        var r = usignature.slice(rStart, rEnd);
        var s = usignature.slice(sStart);
        var rawSignature = new Uint8Array([...r, ...s]);

        let publicKeyECDSA = await crypto.subtle.importKey(
            'spki', // Format of the key
            publicKeyRaw, // ArrayBuffer from PEM
            {
                name: 'ECDSA',
                namedCurve: 'P-256',
                hash: { name: "SHA-256" }   //added
            },
            false, //true
            ['verify']
        );

        let verified = await crypto.subtle.verify(
                {
                    name: 'ECDSA',
                    namedCurve: "P-256", //added
                    hash: { name: 'SHA-256' }
                },
                publicKeyECDSA,
                rawSignature, // Signature from authenticator
                authenticatorDataJSONRaw // authData + SHA256(clientDataJSON)
        );

        console.log('Verified ECDSA');
        console.log(verified);

    
    }

    async function verifyRS256(publicKeyRaw, signatureRaw, authenticatorDataJSONRaw) {
        
        let publicKeyRSA = await crypto.subtle.importKey(
            'spki',                // Format of the key
            publicKeyRaw,             // ArrayBuffer from PEM
            {
                name: 'RSASSA-PKCS1-v1_5',  // or 'RSA-PSS'
                hash: { name: 'SHA-256' }
            },
            true,
            ['verify']
        );
        let verified = await crypto.subtle.verify(
            {
              name: 'RSASSA-PKCS1-v1_5',
              hash: { name: 'SHA-256' }
            },
            publicKeyRSA,
            signatureRaw,       // Signature from authenticator
            authenticatorDataJSONRaw      // authData + SHA256(clientDataJSON)
          );
        console.log('Verified RSA')
        console.log(verified)
    }

    function concatArrayBuffers(buffer1, buffer2) {
        const totalLength = buffer1.byteLength + buffer2.byteLength;
        const result = new Uint8Array(totalLength);
        result.set(new Uint8Array(buffer1), 0);
        result.set(new Uint8Array(buffer2), buffer1.byteLength);
        return arrayBufferToBase64(result.buffer);
    }
      

    function verificationCalculations() {
        
        let settings = {
            'id': assertionData.id,
            'clientDataJSON': assertionData.clientDataJSON,
            'authenticatorData': assertionData.authenticatorData,
            'publicKey': getPublicKey(assertionData.id)['publicKey'],
            'signature': assertionData.signature, 
            'sha256': '',
            'authenticatorJSONCombined': '',
            'verified': ''
        }

        console.log('--------------------------------')


        //Hash
        let hash = sha256(window.atob(settings.clientDataJSON))
        settings.sha256 = CryptoJS.enc.Base64.stringify(hash)

        //AuthData + SHA256(ClientDataJSON)
        settings.authenticatorJSONCombined = concatArrayBuffers(Base64Binary.decode(settings.authenticatorData), Base64Binary.decode(settings.sha256))

        
        let publicKeyRaw = Base64Binary.decode(settings.publicKey)
        console.log('Public Key')
        console.log(settings.publicKey)

        let signatureRaw = Base64Binary.decode(settings.signature)
        console.log('Signature')
        console.log(settings.signature)

        console.log('Client Data JSON')
        console.log(settings.clientDataJSON)

        console.log('SHA(ClientDataJSON)')
        console.log(settings.sha256)

        let authenticatorDataJSONRaw = Base64Binary.decode(settings.authenticatorJSONCombined)
        console.log('Authenticator + SHA(JSON) ')
        console.log(settings.authenticatorJSONCombined)

        console.log('------------------------------')

        if (getAlgoDetails(assertionData.id).algoName == 'RS256') {
            // (-257) RS256: RSASSA-PKCS1-v1_5 using SHA-256

            /*
            //HMAC SHA256
            console.log('PUblic Key')
            console.log(settings.publicKey)

            //1. Perform SHA256 signature on clientDataJSON
            const hash = sha256(settings.clientDataJSON)
            settings.sha256 = CryptoJS.enc.Base64.stringify(hash)

            //2. Combine the Authenticator Bytes and SHA256
            const buffer1 = Buffer.from(settings.authenticatorData, 'base64');
            const buffer2 = Buffer.from(settings.sha256, 'base64');
            
            settings.authenticatorJSONCombined = Buffer.concat([buffer1, buffer2]).toString('base64')
        

            let pem = `-----BEGIN PUBLIC KEY-----\n${settings.publicKey.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`;
            */
            // Import the key and export as JWK
            /*
            (async () => {
            const key = await importSPKI(pem, 'RS256'); // for RSA public key
            const jwk = await exportJWK(key);
            console.log('Done')
            console.log(jwk);
            })();*/

            /*
            let publicKeyRawRS256 = Base64Binary.decode(settings.publicKey)
            let signatureRawRS256 = Base64Binary.decode(settings.signature)
            let authenticatorDataJSONRawRS256 = Base64Binary.decode(settings.authenticatorJSONCombined)
            */

            verifyRS256(publicKeyRaw, signatureRaw, authenticatorDataJSONRaw)

            /*
            (async () => {
                let publicKeyRSA = await crypto.subtle.importKey(
                    'spki',                // Format of the key
                    Base64Binary.decode(settings.publicKey),             // ArrayBuffer from PEM
                    {
                        name: 'RSASSA-PKCS1-v1_5',  // or 'RSA-PSS'
                        hash: { name: 'SHA-256' }
                    },
                    true,
                    ['verify']
                );
                let verified = await crypto.subtle.verify(
                    {
                      name: 'RSASSA-PKCS1-v1_5',
                      hash: { name: 'SHA-256' }
                    },
                    publicKeyRSA,
                    Base64Binary.decode(settings.signature),       // Signature from authenticator
                    Base64Binary.decode(settings.authenticatorJSONCombined)       // authData + SHA256(clientDataJSON)
                  );
                console.log('Verified14')
                console.log(verified)
            })(); */

            

            //Verify 
            //const forge = require('node-forge');
            //let derBuffer = forge.util.createBuffer(settings.publicKey, 'base64');
            /*
            //let publicKey = forge.pki.publicKeyFromDer(derBuffer);
            let publicKey = forge.pkcs12.pkcs12FromAsn1(forge.asn1.fromDer(derBuffer))
            */
            
            /*
            
            const forge = require('node-forge');
            let publicKey = forge.pki.publicKeyFromPem(pem);
            console.log('Done1')

            let data = forge.util.createBuffer(settings.authenticatorJSONCombined, 'base64');
            let signature = forge.util.createBuffer(settings.signature, 'base64');

            console.log('Done0')
            
            console.log('Done2')
            let verified = publicKey.verify(data, signature);
            console.log('Done3')

            settings.verified = String(verified)*/

        } else if (getAlgoDetails(assertionData.id).algoName == 'ES256') {
            // (-7) ES256: ECDSA w/ SHA-256

            //1. Perform SHA256 signature on clientDataJSON
            /*const hashb = sha256(settings.clientDataJSON)
            settings.sha256 = CryptoJS.enc.Base64.stringify(hashb)

            console.log('Authenticator Data:' + settings.authenticatorData)
            console.log('SHA256:' + settings.sha256)

            //2. Combine the Authenticator Bytes and SHA256
            const buffer1b = Buffer.from(settings.authenticatorData, 'base64');
            const buffer2b = Buffer.from(settings.sha256, 'base64');
            
            const mergedb = Buffer.concat([buffer1b, buffer2b])
            console.log('before1')
            console.log(mergedb)
            const resultb = arrayBufferToBase64(mergedb.buffer)
            console.log(resultb)
            console.log(typeof resultb)

            console.log('Before13')
            settings.authenticatorJSONCombined = resultb
            console.log('After13')

            let publicKeyRaw = Base64Binary.decode(settings.publicKey)
            let signatureRaw = Base64Binary.decode(settings.signature)
            let authenticatorDataJSONRaw = Base64Binary.decode(settings.authenticatorJSONCombined)
            */

            verifyES256(publicKeyRaw, signatureRaw, authenticatorDataJSONRaw)


            //let pem1 = `-----BEGIN PUBLIC KEY-----\n${settings.publicKey.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`;

            /*
            crypto.subtle.importKey(
                'spki', // Format of the key
                publicKeyRaw, // ArrayBuffer from PEM
                {
                    name: 'ECDSA',
                    namedCurve: 'P-256'
                },
                true,
                ['verify']
            ).then(publicKeyRSA => {
                return crypto.subtle.verify(
                    {
                        name: 'ECDSA',
                        hash: { name: 'SHA-256' }
                    },
                    publicKeyRSA,
                    signatureRaw, // Signature from authenticator
                    authenticatorDataJSONRaw // authData + SHA256(clientDataJSON)
                );
            }).then(verified => {
                console.log('Verified13');
                console.log(verified);
            }).catch(error => {
                console.error('Verification failed:', error);
            });*/
            
            /*
            (async () => {
                let publicKeyRSA = await crypto.subtle.importKey(
                    'spki',                // Format of the key
                    Base64Binary.decode(settings.publicKey),             // ArrayBuffer from PEM
                    {
                        name: 'ECDSA',
                        namedCurve: 'P-256'
                    },
                    true,
                    ['verify']
                );
                let verified = await crypto.subtle.verify(
                    {
                        name: 'ECDSA',
                        hash: { name: 'SHA-256' }
                      },
                    publicKeyRSA,
                    Base64Binary.decode(settings.signature),       // Signature from authenticator
                    Base64Binary.decode(settings.authenticatorDataJSON)       // authData + SHA256(clientDataJSON)
                  );
                console.log('Verified14')
                console.log(verified)
            })();
            */
        }







        setValidationCalculations(settings)
    }
    useEffect(() => {
        if (assertionData.id.length > 0) {
            verificationCalculations()
        }
    }, [assertionData])

    function getCredentialArray() {
        let creds = []

        savedCredentials.forEach((cred) => {
            creds.push({
                'id': Base64Binary.decode(cred.id),
                'type': 'public-key',
                'transports': cred.transports
            })
        })

        return creds
    }

    function getCredentialArrayStr() {
        let creds = []

        savedCredentials.forEach((cred) => {
            creds.push({
                'id': cred.id,
                'type': 'public-key',
                'transports': cred.transports
            })
        })

        return JSON.stringify(creds, null, 20)
    }

    function verifyPasskey() {
        let options = {
            "publicKey": {
                "challenge": Base64Binary.decode(challenge),
                "rpId": window.location.hostname, 
                "allowCredentials": getCredentialArray(),
                "userVerification": "preferred",
            }
        }

        if (passwordlessMode) {
            options = {
                "publicKey": {
                    "challenge": Base64Binary.decode(challenge),
                    "rpId": window.location.hostname, 
                    "userVerification": "preferred",
                }
            }
        }


        navigator.credentials.get(options)
        .then((response) => {
            console.log('Assertion')
            console.log(response)

            setAssertionData({
                "id": arrayBufferToBase64(response.rawId),
                "authenticatorData": arrayBufferToBase64(response.response.authenticatorData),
                "clientDataJSON": arrayBufferToBase64(response.response.clientDataJSON),
                "signature": arrayBufferToBase64(response.response.signature),
                "userHandle": arrayBufferToBase64(response.response.userHandle)
            })

            setLoginWithPasskeyTab(2)

            //verificationCalculations()
        })

        

    }

    function renderLoginRetrievalJSON() {
        if (passwordlessMode == false) {
            return `
                        navigator.credentials.get(
                            "publicKey": {
                                "challenge": Uint8Array.from("${challenge}"),
                                "rpId": "authfuture.com", 
                                allowCredentials: ${getCredentialArrayStr()},
                                "userVerification": "preferred",
                            }
                        )
                        `
        } else {
            return `
                        navigator.credentials.get(
                            "publicKey": {
                                "challenge": Uint8Array.from("${challenge}"),
                                "rpId": "authfuture.com", 
                                "userVerification": "preferred",
                            }
                        )
                        `
        }
    }

    function renderPasskeyLoginTabPage1() {
        return (
            <>

                <h4>Step 1: Get Passkey Assertion</h4>

                <p><b>Challenge: </b>{challenge}<Button variant="dark" onClick={(event) => {setChallenge(GenerateBase64SecretKey())}}><i class="bi bi-arrow-repeat"></i></Button></p>

                <p><label><input type="checkbox" name="passwordlessMode" checked={passwordlessMode} onChange={(event) => {setPasswordlessMode(event.target.checked)}}/><b> Enable Passwordless Mode</b> (Not available for passkeys with external/non-resident authenticators)</label></p>

                <span>Options provided to browser in navigate.credentials.get()</span>
                <pre>
                    <SyntaxHighlighter language="javascript" style={coldarkDark}>
                        {`
                        ${renderLoginRetrievalJSON()}
                        `}    
                    </SyntaxHighlighter>
                </pre>
                <Button variant="danger" onClick={togglePasskeyLoginTab}>Cancel</Button> <Button variant="success" onClick={(event) => {verifyPasskey()}}>Verify</Button>
            </>
        )
    }

    

    function renderPasskeyLoginTabPage2() {
        return (
            <>

                <h4>Step 2: Assertion Response</h4>

                <pre>
                    <SyntaxHighlighter language="javascript" style={coldarkDark}>
                        {`
                        PublicKeyCredential {
                            "type": "public-key",
                            "authenticatorAttachment": "platform",
                            "id": "${assertionData.id}",
                            "rawId": ArrayBuffer
                            "response": AuthenticatorAssertionResponse {
                                "authenticatorData": ArrayBuffer
                                "clientDataJSON": ArrayBuffer
                                "signature": ArrayBuffer
                                "userHandle": ArrayBuffer
                            }
                        }
                        `}    
                    </SyntaxHighlighter>
                </pre>
                
                <span><b>Assertion Credential ID: </b> {assertionData.id}</span><br/>

                <span><b>Authenticator Data:</b> {assertionData.authenticatorData}</span><br/>

                <p><b>Assertion Signature:</b> {assertionData.signature}</p><br/>

                <span><b>Client Data JSON: </b> {assertionData.clientDataJSON}</span><br/>
                <span><b>SHA256(ClientDataJSON): </b> {validationCalculations.sha256}</span>

                <pre>
                    <SyntaxHighlighter language="javascript" style={coldarkDark}>
                        {`
                        ${window.atob(assertionData.clientDataJSON)}
                        `}    
                    </SyntaxHighlighter>
                </pre>

                

                <div style={{backgroundColor: 'green', border: '1px solid green', borderRadius: '20px', color: '#FFF', display: 'flex', flexDirection: 'row'}}>
                    <div style={{width: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <i class="bi bi-check-circle-fill"></i>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <span><h3>Challenge Verified</h3></span>
                        <span><b>Challenge:</b> {challenge}</span>
                        <span>Set challenge matches challenge returned in Client Data JSON. Prevents replay attacks.</span>
                    </div>
                </div>

                <Button variant="danger" onClick={togglePasskeyLoginTab}>Cancel</Button> <Button variant="success" onClick={(event) => {setLoginWithPasskeyTab(3)}}>Next</Button>
            </>
        )
    }


    function getAlgoDetails(id) {
        let output = {
            'algoNum': -7,
            'algoName': 'ES256'
        }

        savedCredentials.forEach((cred) => {
            if (cred.id === id) {
                output.algoNum = cred.alg
                if (output.algoNum === -7) {
                    output.algoName = 'ES256'
                } else if (output.algoNum === -257) {
                    output.algoName = 'RS256'
                }
            }
        })

        return output
    }

    function getPublicKey(id) {
        let output = {
            'publicKey': ""
        }

        savedCredentials.forEach((cred) => {
            if (cred.id === id) {
                output.publicKey = cred.publicKey
            }
        })

        return output
    }

    function getSavedCred(id) {
         let output = {
            'publicKey': ""
        }

        savedCredentials.forEach((cred) => {
            if (cred.id === id) {
                output = cred
            }
        })

        return output

    }

    function renderLoginPublicKeyJSON() {
        if (getAlgoDetails(assertionData.id)['algoName'] == 'RS256') {
            return `
                        let publicKeyRSA = await crypto.subtle.importKey(
                            'spki',                // Format of the key
                            publicKeyRaw,             // ArrayBuffer from PEM
                            {
                                name: 'RSASSA-PKCS1-v1_5',  // or 'RSA-PSS'
                                hash: { name: 'SHA-256' }
                            },
                            true,
                            ['verify']
                        );
                        `
        } else if (getAlgoDetails(assertionData.id)['algoName'] == 'ES256') {
            return `
                        let publicKeyECDSA = await crypto.subtle.importKey(
                            'spki', // Format of the key
                            publicKeyRaw, // ArrayBuffer from PEM
                            {
                                name: 'ECDSA',
                                namedCurve: 'P-256',
                                hash: { name: "SHA-256" }   //added
                            },
                            false, //true
                            ['verify']
                        );
                        `
        }

    }

    function renderLoginVerifyJSON() {
        if (getAlgoDetails(assertionData.id)['algoName'] == 'RS256') {
            return `
                        let verified = await crypto.subtle.verify(
                            {
                            name: 'RSASSA-PKCS1-v1_5',
                            hash: { name: 'SHA-256' }
                            },
                            Base64.decode(assertation.publicKeyRSA),        // Public Key sourced from Passkey Registration (Assertation stage)
                            Base64.decode(assertion.signatureRaw),          // Assertion Signature
                            Base64.decode(assertion.authenticatorDataJSON)  // authData + SHA256(clientDataJSON)
                        );
                        `
        } else if (getAlgoDetails(assertionData.id)['algoName'] == 'ES256') {
            return `
                        let verified = await crypto.subtle.verify(
                                {
                                    name: 'ECDSA',
                                    namedCurve: "P-256", //added
                                    hash: { name: 'SHA-256' }
                                },
                                publicKeyECDSA,
                                rawSignature, // Signature from authenticator
                                authenticatorDataJSONRaw // authData + SHA256(clientDataJSON)
                        );
                        `
        }

    }

    function renderPasskeyLoginTabPage3() {
        return (
            <>

                <h4>Step 3: Import Public Key of Matched Passkey</h4>

                <p><b>Assertion Credential ID:</b> {assertionData.id}</p>

                <div style={{backgroundColor: 'green', border: '1px solid green', borderRadius: '20px', color: '#FFF', display: 'flex', flexDirection: 'row'}}>
                    <div style={{width: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <i class="bi bi-check-circle-fill"></i>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <span><h3>Assertion Credential ID Matched with Passkey #{getSavedCred(assertionData.id).idNum}</h3></span>
                        <span><b>Passkey #{getSavedCred(assertionData.id).idNum} Credential ID:</b> {assertionData.id}</span>
                    </div>
                </div>

                <p><b>Passkey #{getSavedCred(assertionData.id).idNum} Public Key: </b> {getPublicKey(assertionData.id)['publicKey']} </p>
                <pre>
                    <SyntaxHighlighter language="javascript" style={coldarkDark}>
                        {`
                        ${renderLoginPublicKeyJSON()}
                        `}    
                    </SyntaxHighlighter>
                </pre>
                <br/>
                <br/>        

               <br/>

                <Button variant="danger" onClick={togglePasskeyLoginTab}>Cancel</Button> <Button variant="success" onClick={(event) => {setLoginWithPasskeyTab(4)}}>Verify</Button>
            </>
        )
    }

     function renderPasskeyLoginTabPage4() {
        return (
            <>

                <h4>Step 4: Verification</h4>

                <p><b>Algorithm:</b> {getAlgoDetails(assertionData.id)['algoName']}</p>
                <p><b>Passkey #{getSavedCred(assertionData.id).idNum} Public Key: </b> {getPublicKey(assertionData.id)['publicKey']} </p>
                <p><b>Authenticator Data + SHA256(ClientDataJSON):</b> {validationCalculations.authenticatorJSONCombined}</p>
                <p><b>Assertion Signature:</b> {validationCalculations.signature}</p>

                <pre>
                    <SyntaxHighlighter language="javascript" style={coldarkDark}>
                        {`
                        let verified = await crypto.subtle.verify(
                            {
                            name: 'RSASSA-PKCS1-v1_5',
                            hash: { name: 'SHA-256' }
                            },
                            Base64.decode(assertation.publicKeyRSA),        // Public Key sourced from Passkey Registration (Assertation stage)
                            Base64.decode(assertion.signatureRaw),          // Assertion Signature
                            Base64.decode(assertion.authenticatorDataJSON)  // authData + SHA256(clientDataJSON)
                        );
                        `}    
                    </SyntaxHighlighter>
                </pre>      
                <div style={{backgroundColor: 'green', border: '1px solid green', borderRadius: '20px', color: '#FFF', display: 'flex', flexDirection: 'row'}}>
                    <div style={{width: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <i class="bi bi-check-circle-fill"></i>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <span><h3>Passkey Login Successful - Assertion Verified</h3></span>
                        <span><b>Assertion Signature</b> decrypted with <b>Passkey #{getSavedCred(assertionData.id).idNum} Public Key</b> using <b>{getAlgoDetails(assertionData.id)['algoName']}</b> = SHA-256 Hash of <b>AuthenticatorData + SHA256(ClientDataJSON)</b></span>
                    </div>
                </div>  

                <Button variant="danger" onClick={togglePasskeyLoginTab}>Cancel</Button> <Button variant="success" onClick={(event) => {setLoginWithPasskeyTab(0)}}>Finish</Button>
            </>
        )
    }

    function passkeyVerifyTabTitle() {
        return (
            <>
                <div id="passkey-tab-title" style={{color: '#FFF', backgroundColor: '#2a2a2a'}}><h4>Verify Passkey</h4></div>
            </>
        )
    }

    function renderLoginPasskeyTab() {
        if (loginWithPasskeyTab === 1) {
            return (
                <>
                    {passkeyVerifyTabTitle()}
                    {renderPasskeyLoginTabPage1()}
                </>
            )
        } else if (loginWithPasskeyTab === 2) {
            return (
                <>
                    {passkeyVerifyTabTitle()}
                    {renderPasskeyLoginTabPage2()}
                </>
            )
        } else if (loginWithPasskeyTab === 3) {
            return (
                <>
                    {passkeyVerifyTabTitle()}
                    {renderPasskeyLoginTabPage3()}
                </>
            )
        } else if (loginWithPasskeyTab === 4) {
            return (
                <>
                    {passkeyVerifyTabTitle()}
                    {renderPasskeyLoginTabPage4()}
                </>
            )
        }
    }

    const CustomNode = ({ data }) => {
        const handles = Array.isArray(data?.handles) ? data.handles : [];

        return (
            <div style={{ border: '0px solid ' + data.bgColor, borderRadius: '12px', width: '200px', height: data.height ? data.height : '100px', zIndex: 10, position: 'relative'}}>
                {handles.map((handle, index) => (
                    <Handle
                    key={index}
                    type={handle.type}           // 'source' or 'target'
                    position={handle.position}   // e.g. Position.Top, Position.Bottom
                    id={handle.id}               // optional but useful for complex graphs
                    style={handle.style || {}}
                    />
                ))}
                <div style={{paddingLeft: 'auto', paddingRight: 'auto', opacity: 1, border: '3px solid rgb(155, 89, 182)', borderRadius: '10px', width: '100%', height: '100%'}}>
                    <div id="node-label">
                        <span style={{fontSize: '14px', color: '#FFF'}}><i class={data.icon ? data.icon : ''}></i> {data.label}</span>
                    </div>
                </div>
            </div>
        );
    };

    const PlatformNode = ({ data }) => {
        return (
            <div style={{ padding: 10, border: '1px solid rgb(17, 17, 17)', borderRadius: 5, color: '#FFF', background: 'rgb(17, 17, 17)', width: '1200px', height: '200px', zIndex: -1, position: 'relative' }}>
                <div>
                    <span style={{fontSize: '20px'}}><i class={data.icon}></i> {data.platformName}</span>
                </div>
            </div>
        );
    };

    

    function passkeyDiagram() {
        const nodeTypes = {
            custom: CustomNode,
            platform: PlatformNode
        }

        const registrationNodes = [
        {
            id: '0',
            type: 'platform',
            position: { x: 0, y: 0 },
            data: { platformName: 'Server', icon: 'bi bi-hdd-stack-fill' },
            sourcePosition: 'right',
            targetPosition: 'left'
        },
        {
            id: '1',
            type: 'platform',
            position: { x: 0, y: 250 },
            data: { platformName: 'Browser', icon: 'bi bi-person-fill' },
            sourcePosition: 'right',
            targetPosition: 'left'
        },
        {
            id: '2',
            type: 'platform',
            position: { x: 0, y: 500 },
            data: { platformName: 'Authenticator', icon: 'bi bi-shield-fill-check' },
            sourcePosition: 'right',
            targetPosition: 'left'
        },
        {
            id: '3',
            type: 'custom',
            position: { x: 175, y: 50 },
            data: { id: '3', label: 'Credential Creation Options for Browser', icon: 'bi bi-1-circle', bgColor: 'rgb(155, 89, 182)',
                handles: [
                { type: 'target', position: Position.Left, id: 'input1' },
                { type: 'source', position: Position.Bottom, id: 'output1' }
                ]
             },
            sourcePosition: 'right',
            targetPosition: 'left',
            
        },
        {
            id: '4',
            type: 'custom',
            position: { x: 500, y: 300 },
            data: { label: 'Browser calls navigator.credentials.create()', icon: 'bi bi-2-circle', bgColor: 'rgb(155, 89, 182)',
                handles: [
                { type: 'target', position: Position.Left, id: 'input1' },
                { type: 'source', position: Position.Right, id: 'output1' },
                { type: 'source', position: Position.Bottom, id: 'output2' },
                { type: 'target', position: Position.Bottom, id: 'input2' },
                ]
              },
            sourcePosition: 'right',
            targetPosition: 'left'
        },
        {
            id: '5',
            type: 'custom',
            position: { x: 500, y: 550 },
            data: { label: 'Create Key Pair', icon: 'bi bi-3-circle',
                handles: [
                { type: 'target', position: Position.Top, id: 'input1' },
                { type: 'source', position: Position.Left, id: 'output1' }
                ]
              },
            sourcePosition: 'up',
            targetPosition: 'top'
        },
        {
            id: '6',
            type: 'custom',
            position: { x: 975, y: 50 },
            data: { label: 'Store Public Key', icon: 'bi bi-4-circle',
                handles: [
                { type: 'target', position: Position.Bottom, id: 'input1' },
                { type: 'source', position: Position.Right, id: 'output1' }
                ]
              },
            sourcePosition: 'right',
            targetPosition: 'left'
        }
        ];

        const registrationEdges = [
        { id: 'e1-2', source: '3', target: '4', type: 'straight', markerEnd: {type: 'arrowclosed'}, style: { strokeWidth: 3, stroke: '#808080', zIndex: 10, borderWidth: '3px'}},
        { id: 'e2-3', source: '4', target: '5', type: 'straight', sourceHandle: 'output2',  markerStart: {type: 'arrowclosed'}, markerEnd: {type: 'arrowclosed'}, style: { strokeWidth: 3, stroke: '#808080', zIndex: 10 }},
        { id: 'e3-4', source: '4', target: '6', type: 'straight', markerEnd: {type: 'arrowclosed'}, style: { strokeWidth: 3, stroke: '#808080', zIndex: 10 } }
        ];

        const verificationNodes = [
        {
            id: '0',
            type: 'platform',
            position: { x: 0, y: 0 },
            data: { platformName: 'Server', icon: 'bi bi-hdd-stack-fill' },
            sourcePosition: 'right',
            targetPosition: 'left'
        },
        {
            id: '1',
            type: 'platform',
            position: { x: 0, y: 250 },
            data: { platformName: 'Browser', icon: 'bi bi-person-fill' },
            sourcePosition: 'right',
            targetPosition: 'left'
        },
        {
            id: '2',
            type: 'platform',
            position: { x: 0, y: 500 },
            data: { platformName: 'Authenticator', icon: 'bi bi-shield-fill-check' },
            sourcePosition: 'right',
            targetPosition: 'left'
        },
        {
            id: '3',
            type: 'custom',
            position: { x: 175, y: 30 },
            data: { label: 'Server Generates Credential Verification Options', icon: 'bi bi-1-circle',
                height: '140px',
                handles: [
                { type: 'target', position: Position.Left, id: 'input1' },
                { type: 'source', position: Position.Bottom, id: 'output1' }
                ]
             },
            sourcePosition: 'right',
            targetPosition: 'left'
        },
        {
            id: '4',
            type: 'custom',
            position: { x: 500, y: 300 },
            data: { label: 'Browser Calls navigator.credentials.get()', icon: 'bi bi-2-circle',
                handles: [
                { type: 'target', position: Position.Left, id: 'input1' },
                { type: 'source', position: Position.Right, id: 'output1' },
                { type: 'source', position: Position.Bottom, id: 'output2' },
                ]
             },
            sourcePosition: 'right',
            targetPosition: 'left'
        },
        {
            id: '5',
            type: 'custom',
            position: { x: 500, y: 550 },
            data: { label: 'Local Authenticator Returns Assertion Signature', icon: 'bi bi-3-circle',
                handles: [
                { type: 'target', position: Position.Top, id: 'input1' },
                { type: 'source', position: Position.Left, id: 'output1' }
                ]
             },
            sourcePosition: 'right',
            targetPosition: 'left'
        },
        {
            id: '6',
            type: 'custom',
            position: { x: 750, y: 300 },
            data: { label: 'Send Assertion Response to Server', icon: 'bi bi-4-circle',
                handles: [
                { type: 'target', position: Position.Left, id: 'input1' },
                { type: 'source', position: Position.Right, id: 'output1' }
                ]
             },
            sourcePosition: 'right',
            targetPosition: 'left'
        },
        {
            id: '7',
            type: 'custom',
            position: { x: 975, y: 30 },
            data: { label: 'Validate Assertion Signature with Stored Public Key', icon: 'bi bi-5-circle',
                height: '140px',
                handles: [
                { type: 'target', position: Position.Bottom, id: 'input1' },
                { type: 'source', position: Position.Right, id: 'output1' }
                ]
             },
            sourcePosition: 'right',
            targetPosition: 'left'
        }
        ];

        const verificationEdges = [
        { id: 'e1-2', source: '1', target: '2', type: 'straight', markerEnd: {type: 'arrowclosed'}, style: { strokeWidth: 3, stroke: '#808080', zIndex: 10 }},
        { id: 'e2-3', source: '2', target: '3', type: 'straight', markerEnd: {type: 'arrowclosed'}, style: { strokeWidth: 3, stroke: '#808080', zIndex: 10 } },
        { id: 'e3-4', source: '3', target: '4', type: 'straight', markerEnd: {type: 'arrowclosed'}, style: { strokeWidth: 3, stroke: '#808080', zIndex: 10 } },
        { id: 'e4-5', source: '4', target: '5', sourceHandle: 'output2', type: 'straight', markerStart: {type: 'arrowclosed'}, markerEnd: {type: 'arrowclosed'}, style: { strokeWidth: 3, stroke: '#808080', zIndex: 10 } },
        { id: 'e4-6', source: '4', target: '6', type: 'straight', markerEnd: {type: 'arrowclosed'}, style: { strokeWidth: 3, stroke: '#808080', zIndex: 10 } },
        { id: 'e6-7', source: '6', target: '7', type: 'straight', markerEnd: {type: 'arrowclosed'}, style: { strokeWidth: 3, stroke: '#808080', zIndex: 10 } },
        ];

        if (passkeyDiagramTab == 0) {
            //Assertion (Registration)
            return (
                <>
                    <ReactFlowProvider>
                        <div style={{width: '100%', height: '750px'}}>
                            <ReactFlow colorMode="dark" nodes={registrationNodes} edges={registrationEdges} nodeTypes={nodeTypes}
                            fitView
                            zoomOnScroll={false}
                            zoomOnPinch={false}
                            panOnScroll={false}
                            panOnDrag={false}
                            nodesDraggable={false}
                            nodesConnectable={false}
                            elementsSelectable={false}
                            preventScrolling={false} 
                            panOnScrollMode={null}/>
                        </div>
                    </ReactFlowProvider>
                </>
            )
        } else {
            //Assertation (Verification)
            return (
                <>
                    <ReactFlowProvider>
                        <div style={{width: '100%', height: '750px'}}>
                            <ReactFlow nodes={verificationNodes} edges={verificationEdges} nodeTypes={nodeTypes} 
                            fitView
                            zoomOnScroll={false}
                            zoomOnPinch={false}
                            panOnScroll={false}
                            panOnDrag={false}
                            nodesDraggable={false}
                            nodesConnectable={false}
                            elementsSelectable={false}
                            preventScrolling={false} 
                            panOnScrollMode={null}
                            />
                        </div>
                    </ReactFlowProvider>
                </>
            )
        }
    }


    function passkeyExplanation() {
        
                
        return (
            <>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <div>
                        <p>Passkeys enable users to securely login to web apps using a local authenticator either as MFA or instead of a password.</p>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%'}}> 
                        <ButtonGroup aria-label="Basic example">
                            <Button variant={passkeyDiagramTab == 0 ? 'dark' : 'outline-dark'} onClick={(event) => {setPasskeyDiagramTab(0)}}>Passkey Registration (Assertation)</Button>
                            <Button variant={passkeyDiagramTab == 1 ? 'dark' : 'outline-dark'}  onClick={(event) => {setPasskeyDiagramTab(1)}}>Passkey Verification (Assertion)</Button>
                        </ButtonGroup>
                    </div>
                    <div style={{width: '100%'}}>
                        {passkeyDiagram()}
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
        <section style={{backgroundColor: '#f1f1f1', color: '#000', paddingTop: '10px', paddingBottom: '30px'}}>
            <Container>
                <link rel="stylesheet" href="/css/webauthn-tool.css"></link>

                <h2>WebAuthn Passkeys</h2>
                <div id="webauthn-explanation-container">
                    {passkeyExplanation()}
                </div>

                <h2>Passkeys Demo</h2>

                <div id="webauthn-tool-container" style={{}}>
                    

                    <div id="webauthn-register" style={{borderBottom: '1px solid #000'}}>
                        <h3><i class="bi bi-sliders"></i> Configure Passkeys</h3>

                        <div>
                            <div id="passkey-list" style={{paddingBottom: '20px'}}>
                                {renderListRegisteredPasskeys()}
                            </div>
                            <div id="passkey-register-tab" style={{backgroundColor: 'transparent'}}>
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
                                        <Button variant="dark" onClick={toggleRegisterNewPasskeyTab}><i class="bi bi-plus-circle"></i> Add New Passkey</Button>
                                    )
                                }
                            })()}
                        </div>

                        
                    </div>
                    <div id="webauthn-login">
                        <h3><i class="bi bi-box-arrow-in-right"></i> Login with Passkey</h3>

                        {renderLoginPasskeyTab()}
                        
                        {(() => {
                            if (loginWithPasskeyTab === 0) {
                                if (savedCredentials.length > 0) {
                                    return (
                                    <Button onClick={togglePasskeyLoginTab} variant="dark">Start</Button>
                                    )
                                } else {
                                    return (
                                        <>
                                            <div style={{display: 'flex', flexDirection: 'column'}}>
                                                <span style={{color: 'red', fontSize: '18px'}}><i class="bi bi-exclamation-circle"></i> No passkeys configured</span>
                                                <div><Button variant="dark" disabled >Start</Button></div>
                                            </div>
                                        </>
                                    )
                                }
                            }
                        })()}
                    </div>
                </div>
            </Container>
        </section>
        </>
    );
}