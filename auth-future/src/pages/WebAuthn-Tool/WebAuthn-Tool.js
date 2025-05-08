//import { Button } from "react-bootstrap";


import { NavigationBar } from "../../features/NavigationBar/NavigationBar";

import {Button, Container, Modal} from 'react-bootstrap';

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

    

    const [verifyPasskeyTab, setVerifyPasskeyTab] = useState(0)


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
                    "id": "localhost", 
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
                    "authenticatorAttachment": "platform",
                    "userVerification": "preferred",
                    "requireResidentKey": true
                },
                "excludeCredentials": []
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
                        <Accordion.Header>Passkey #{item.idNum}       <span>         </span>        <i>ID: ({item.id})</i> </Accordion.Header>
                        <Accordion.Body style={{textWrap: 'wrap', textWrapStyle: 'pretty', overflowWrap:'break-word'}}>
                            <span><b>Credential ID: </b> {item.id}</span><br/>

                            <span><b>Public Key (Base 64): </b> </span><br/>

                            <div style={{textWrap: 'wrap', textWrapStyle: 'pretty', overflowWrap:'break-word'}}>
                                <p style={{textWrap: 'wrap', textWrapStyle: 'pretty', overflowWrap:'break-word'}}>{item.publicKey}</p>
                            </div>

                            <span><b>Algorithm:</b> {item.alg}</span><br/>

                            <span><b>Transports: </b> {item.transports}</span><br/>


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

                <p><b>Challenge: </b>{challenge}</p> <Button variant="dark" onClick={(event) => {setChallenge(GenerateBase64SecretKey())}}><i class="bi bi-arrow-repeat"></i></Button>

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
                                    "authenticatorAttachment": "platform",
                                    "userVerification": "preferred",
                                    "requireResidentKey": True
                                },
                                "excludeCredentials": []
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

        return JSON.stringify(creds)
    }

    function verifyPasskey() {
        navigator.credentials.get({
            "publicKey": {
                "challenge": Base64Binary.decode(challenge),
                "rpId": "localhost", 
                "allowCredentials": getCredentialArray(),
                "userVerification": "preferred",
            }
        })
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

            //verificationCalculations()
        })

        setLoginWithPasskeyTab(2)

    }

    function renderPasskeyLoginTabPage1() {
        return (
            <>

                <h4>Step 1: Get Passkey Assertion</h4>

                <p><b>Challenge: </b>{challenge}</p> <Button variant="dark" onClick={(event) => {setChallenge(GenerateBase64SecretKey())}}><i class="bi bi-arrow-repeat"></i></Button>


                <span>Options provided to browser in navigate.credentials.get()</span>
                <pre>
                    <SyntaxHighlighter language="javascript" style={coldarkDark}>
                        {`
                        navigator.credentials.get(
                            "publicKey": {
                                "challenge": Uint8Array.from("${challenge}"),
                                "rpId": "authfuture.com", 
                                allowCredentials: ${getCredentialArrayStr()},
                                "userVerification": "preferred",
                            }
                        )
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

                <span>Options provided to browser in navigate.credentials.get()</span>
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
                
                <span><b>Credential ID: </b> {assertionData.id}</span><br/>

                <span><b>User Handle:</b> {assertionData.userHandle}</span><br/>

                <span><b>Authenticator Data (Base 64):</b> {assertionData.authenticatorData}</span><br/>

                <span><b>Signature (Base 64):</b> {assertionData.signature}</span><br/>

                <span><b>Client Data JSON: </b></span><br/>
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
                        <span>Set challenge matches challenge returned in Client Data JSON</span>
                    </div>
                </div>

                <Button variant="danger" onClick={togglePasskeyLoginTab}>Cancel</Button> <Button variant="success" onClick={(event) => {setLoginWithPasskeyTab(3)}}>Verify</Button>
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

    function renderPasskeyLoginTabPage3() {
        return (
            <>

                <h4>Step 3: Verify Assertion Response</h4>

                <h5>Credential Details</h5>

                <span><b>Credential ID: </b> {assertionData.id}</span><br/>

                <span><b>Authenticator Data (Base 64):</b> {assertionData.authenticatorData}</span><br/>

                <span><b>Client Data JSON (Base 64):</b> {assertionData.clientDataJSON}</span><br/>

                <span><b>Signature (Base 64):</b> {assertionData.signature}</span><br/>

                <span><b>Public Key (Base 64):</b> </span><br/>

                {getPublicKey(assertionData.id)['publicKey']} <br/>

                <span><b>Public Key Raw:</b></span><br/>

                {atob(getPublicKey(assertionData.id)['publicKey'])}<br/>

                <span><b>Algorithm: </b> {getAlgoDetails(assertionData.id)['algoNum']} ({getAlgoDetails(assertionData.id)['algoName']})</span><br/>
                <div style={{backgroundColor: 'green', borderRadius: '15px', color: '#FFF'}}>
                    <h4> <i class="bi bi-check-circle-fill"></i> Assertion Verification</h4>
                    <div>
                        <ol>
                            <li><b>SHA-256 Hash of Client Data JSON:</b> {validationCalculations.sha256}</li>
                            <li><b>Authenticator Data:</b> </li>
                            <li><b>Authenticator Data + SHA256(ClientDataJSON):</b> {validationCalculations.authenticatorJSONCombined}</li>
                            <li>Verified {validationCalculations.verified}</li>
                            <li><b>Authenticator </b></li>
                            <li>ID {validationCalculations.id}</li>
                        </ol>
                    </div>
                </div>

               <br/>

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

                        {renderLoginPasskeyTab()}
                        
                        {(() => {
                            if (loginWithPasskeyTab === 0) {
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