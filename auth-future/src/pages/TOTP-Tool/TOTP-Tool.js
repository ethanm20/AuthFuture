import {Button, Container, Modal} from 'react-bootstrap';

import Accordion from 'react-bootstrap/Accordion';

import { GenerateBase32SecretKey } from './utilities/generate-base-32-key';
import { useState, useEffect } from 'react';

import base64 from 'crypto-js/enc-base64';

//import hmac from 'crypto-js/hmac-sha256';

import hmac from 'crypto-js/hmac-sha1';
import { arrayBufferToBase64 } from '../WebAuthn-Tool/utilities/base64';

const Long = require("long");

const base32 = require('base32.js');

export function TOTPTool() {
    const [secretKeyValue, setSecretKey] = useState(GenerateBase32SecretKey());

    const [QRImgValue, setQRImgValue] = useState('bbb');

    const [QRTextValue, setQRTextValue] = useState('bbb');

    const [currTimeValue, setCurrTimeValue] = useState(new Date())

    const [currTimeStr, setCurrTimeStr] = useState(currTimeValue.toUTCString())

    const [currTimeEpoch, setCurrTimeEpoch] = useState(Date.now())

    const [openIntervalTabNo, setOpenIntervalTabNo] = useState(-1)

    const [providerName, setProviderName] = useState('AuthFuture')

    const [QRUsername, setQRUsername] = useState('random@random.com')

    const [QRDetailsModalShow, setQRDetailsModalShow] = useState(false);



    const initialTOTPList = [
        {'id': 0,
        'name': 'T-90',
        'timeOffset': -90,
        'epochTime': 0,
        'strTime': ''
        },
        {'id': 1,
        'name': 'T-60',
        'timeOffset': -60,
        'epochTime': 0,
        'strTime': ''
        },
        {'id': 2,
        'name': 'T-30',
        'timeOffset': -30,
        'epochTime': 0,
        'strTime': ''
        },
        {'id': 3,
        'name': 'T-0',
        'timeOffset': 0,
        'epochTime': 0,
        'strTime': ''
        },
        {'id': 4,
        'name': 'T+30',
        'timeOffset': 30,
        'epochTime': 0,
        'strTime': ''
        },
        {'id': 5,
        'name': 'T+60',
        'timeOffset': 60,
        'epochTime': 0,
        'strTime': ''
        }, 
        {'id': 6,
        'name': 'T+90',
        'timeOffset': 90,
        'epochTime': 0,
        'strTime': ''
        }
    ]

    const [TOTPList, setTOTPList] = useState([])
    useEffect(() => {
        updateTOTPCalculation()
    }, [])

    //Updates both QR Image and Text
    function updateQRTextImage() {
        let qrCodeLabel = 'AuthFuture';
        let qrCodeEmail = "username";
        let qrCodeSecret = secretKeyValue;  
        let qrCodeDigits = 6;
        let qrCodePeriod = 30;
        let qrCodeStr = 'otpauth://totp/' + providerName + ':' + QRUsername + '?secret=' + qrCodeSecret + '&issuer=' + qrCodeLabel + '&digits=' + qrCodeDigits + '&period=' + qrCodePeriod;
        
        setQRTextValue(qrCodeStr)

        const QRCode = require('qrcode');

        QRCode.toDataURL(qrCodeStr, {
                errorCorrectionLevel: 'H',
                type: 'image/png'
            },
            function(err, url) {
                if (err) throw err;
                setQRImgValue(url);
            }
        );
    }

    useEffect(() => {
        updateQRTextImage();
    }, [secretKeyValue, QRUsername, providerName])
    
    function clickGenerateSecretKey() {
        const randomKey = GenerateBase32SecretKey()

        setSecretKey(randomKey)


    }

    function clickValidate2FA() {
        return null;
    }

    function handleNewKey(key) {
        setSecretKey(key)
    }
    //-------------------------------------------------------------------------
    //INTERVAL 
    
    // Executes every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
          updateTOTPCalculation();
        }, 30000);
      
        return () => clearInterval(interval);
      }, []);
    
    function encodeLongLongInt(valueStr) {
        const longVal = Long.fromString(valueStr); // Supports large integers
        const bytes = longVal.toBytesBE(); // Big-endian byte array (8 bytes)

        return Uint8Array.from(bytes);
    }

    function decodeBase32ToArrayBuffer(base32Str) {
        const decoder = new base32.Decoder();
        const uint8Array = decoder.write(base32Str).finalize();

        const newArrayBuffer = new Uint8Array(uint8Array).buffer

        console.log('UINT8')
        console.log(uint8Array)
        console.log(typeof uint8Array)
        console.log('Buffer')
        console.log(newArrayBuffer)
        // Convert Uint8Array to ArrayBuffer

        return newArrayBuffer
    }
      

    async function hmacSha1(key, countInt) {
        ///const encoder = new TextEncoder();

        console.log('Keey')
        console.log(key)
        const keyRawBytes = decodeBase32ToArrayBuffer(key)

        console.log('Buffer3')
        console.log(keyRawBytes)
      
        // Import the secret key
        const cryptoKey = await crypto.subtle.importKey(
          'raw', 
          keyRawBytes, 
          { name: 'HMAC', hash: 'SHA-1' }, 
          false, 
          ['sign']
        );

        console.log('AFTER8')
      
        // Sign the message using the key
        const signature = await crypto.subtle.sign(
          'HMAC', 
          cryptoKey, 
          encodeLongLongInt(String(countInt))
        );
      
        // Convert ArrayBuffer to hex string
        const hashArray = Array.from(new Uint8Array(signature));

        console.log('KEY')
        console.log(key)

        console.log('HOP COUNT')
        console.log(countInt)

        console.log('FINAL HASH B64')
        console.log(arrayBufferToBase64(hashArray))
      
        return hashArray;
    }


    async function updateTOTPCalculation() {
        //Update global time
        const timeEpoch = Date.now()
        setCurrTimeEpoch(timeEpoch)

        let TOTPListNew = []

        const TOTPTimeOffsets = [-90, -60, -30, 0, 30, 60, 90]

        for (let idx=0; idx <= 6; idx++) {
            const item = TOTPTimeOffsets[idx]

            let name = ""
            if (TOTPTimeOffsets[idx] < 0) {
                name = 'T' + parseInt(item) + 's'
            } else if (TOTPTimeOffsets[idx] > 0) {
                name = 'T+' + parseInt(item) + 's'
            } else {
                name = 'Now'
            }
            //Step 0 Initialisation
            TOTPListNew.push({
                'id': idx,
                'name': name,
                'timeOffset': item,
                'epochTime': timeEpoch + (item * 1000),
                'strTime': '',
                'hopCount': 0,
                'hmacSig': null,
                'offset': null,
                'lastByte': null,
                'asciiHash': null,
                'truncatedHashAscii': null,
                'truncatedByte1': null,
                'truncatedByte2': null,
                'truncatedByte3': null,
                'truncatedByte4': null,
                'truncatedHash': null,
                'truncatedBytes': null,
                'longTOTPCode': null,
                'shortTOTPCode': 111111,
                'shortTOTPCodeFormatted': "111111"
            })

            //Step 1 & Step 2: Update Time for Item
            TOTPListNew[idx].strTime = new Date(TOTPListNew[idx].epochTime).toUTCString()

            //Step 3: Update Hop Count
            TOTPListNew[idx].hopCount = parseInt((TOTPListNew[idx].epochTime / 1000) / 30)

            //Step 4: Encode hop count as long long int
            


            //Step 5: HMAC Hash
            //TOTPListNew[idx].hmacSig = hmac(TOTPListNew[idx].hopCount.toString(), secretKeyValue);
            

            
            TOTPListNew[idx].hmacSig = await hmacSha1(secretKeyValue, TOTPListNew[idx].hopCount)

            //const asciiHash = atob(arrayBufferToBase64(hmacSig));
            TOTPListNew[idx].asciiHash = atob(arrayBufferToBase64(TOTPListNew[idx].hmacSig));

            // Get last character (each char = 1 byte)
            //const lastByte = asciiHash[asciiHash.length - 1].charCodeAt(0);
            TOTPListNew[idx].lastByte = TOTPListNew[idx].asciiHash[TOTPListNew[idx].asciiHash.length - 1].charCodeAt(0);

            // Convert char to byte value (0–255)
            console.log('LastByte')
            console.log(TOTPListNew[idx].lastByte)

            //const offset = lastByte & 0x0F
            TOTPListNew[idx].offset = TOTPListNew[idx].lastByte & 0x0F

            console.log('Offset')
            console.log(TOTPListNew[idx].offset)

            //const truncatedHash = hmacSig.slice(offset, (offset + 4))
            TOTPListNew[idx].truncatedHash = TOTPListNew[idx].hmacSig.slice(TOTPListNew[idx].offset, (TOTPListNew[idx].offset + 4))

            console.log('Truncated Hash')
            console.log(TOTPListNew[idx].truncatedHash)


            //Long Code
            //let truncatedBytes = new Uint8Array(truncatedHash)

            TOTPListNew[idx].truncatedBytes = new Uint8Array(TOTPListNew[idx].truncatedHash)

            console.log('Truncated Bytes')
            console.log(TOTPListNew[idx].truncatedBytes)

            const dataView = new DataView(TOTPListNew[idx].truncatedBytes.buffer, TOTPListNew[idx].truncatedBytes.byteOffset, TOTPListNew[idx].truncatedBytes.byteLength);
            let code = dataView.getUint32(0, false); 
            TOTPListNew[idx].longTOTPCode = code & 0x7FFFFFFF;

            console.log('Long Code')
            console.log(TOTPListNew[idx].longTOTPCode)

            TOTPListNew[idx].shortTOTPCode  = TOTPListNew[idx].longTOTPCode % (10 ** 6)

            console.log('Short Code')
            console.log(TOTPListNew[idx].shortTOTPCode )


            TOTPListNew[idx].shortTOTPCodeFormatted = String(TOTPListNew[idx].shortTOTPCode).padStart(6, '0');

           

            

            //TOTPListNew[idx].asciiHash = atob(arrayBufferToBase64(TOTPListNew[idx].hmacSig))
            
            //TOTPListNew[idx].hmacSig = hmacSig
            
                /*TOTPListNew[idx].hmacSig = hmac

                TOTPListNew[idx].asciiHash = atob(arrayBufferToBase64(TOTPListNew[idx].hmacSig))

            

            TOTPListNew[idx].lastByte = TOTPListNew[idx].asciiHash.at(-1).charCodeAt(0)

            TOTPListNew[idx].offset = TOTPListNew[idx].lastByte & 0x0F;

            // & 0x0F

            //Setp 7: Trucated Hash
            TOTPListNew[idx].truncatedHashAscii = TOTPListNew[idx].asciiHash.slice(TOTPListNew[idx].offset, (TOTPListNew[idx].offset + 4))

            TOTPListNew[idx].truncatedByte1 = TOTPListNew[idx].truncatedHashAscii.charCodeAt(0)
            TOTPListNew[idx].truncatedByte2 = TOTPListNew[idx].truncatedHashAscii.charCodeAt(1)
            TOTPListNew[idx].truncatedByte3 = TOTPListNew[idx].truncatedHashAscii.charCodeAt(2)
            TOTPListNew[idx].truncatedByte4 = TOTPListNew[idx].truncatedHashAscii.charCodeAt(3)

            //Step 8: Long TOTP Code
            TOTPListNew[idx].longTOTPCode = 0
            for (let i = 0; i < 3; i++) {
                // Convert each character to its ASCII value and concatenate
                TOTPListNew[idx].longTOTPCode += TOTPListNew[idx].truncatedHashAscii.charCodeAt(i);
            }

            let encoder = new TextEncoder();
            let encodedHashArray = encoder.encode(TOTPListNew[idx].truncatedHashAscii)
            //console.log(encodedHashArray)
            let buffer = encodedHashArray.buffer;
            let view = new DataView(buffer);
            TOTPListNew[idx].longTOTPCode = view.getUint32(0);

            

            //Step 9: Short TOTP Code
            TOTPListNew[idx].shortTOTPCode = TOTPListNew[idx].longTOTPCode & 0x7FFFF;
            TOTPListNew[idx].shortTOTPCode = TOTPListNew[idx].longTOTPCode % (10 ** 6);

            //Step 10: Formatting
            TOTPListNew[idx].shortTOTPCodeFormatted = TOTPListNew[idx].shortTOTPCode.toString().padStart(6, '0');
            })
            */

            /*
            console.log('HMAC SIG')
            console.log(TOTPListNew[idx].hmacSig)
            console.log(arrayBufferToBase64(TOTPListNew[idx].hmacSig))
            let binaryStr = atob(arrayBufferToBase64(TOTPListNew[idx].hmacSig))
            //let binaryStr = "a"

            

            TOTPListNew[idx].decimal = 0
            for (let i = 0; i < binaryStr.length; i++) {
                // Convert each character in the binary string to its byte value
                TOTPListNew[idx].decimal = TOTPListNew[idx].decimal * 256 + binaryStr.charCodeAt(i); // 256 is used as each character represents one byte
              }


            //Step 6: Calculate Offset
            //TOTPListNew[idx].offset = (285 >> 2);

            //TOTPListNew[idx].offset = (12285 & 0xFF) & 0x0F;

            //TOTPListNew[idx].offset = (Number(parseInt(TOTPListNew[idx].hmacSig, 16)) & 0xFF) & 0x0F;

            //TOTPListNew[idx].offset = Number(parseInt(TOTPListNew[idx].hmacSig, 16)) ;
            */
            /*
            ------------------------------
            {item.hmacSig.toString(base64).slice(-1)}
            |------------------------------
            {atob(item.hmacSig).at(-1).charCodeAt(0) & 0x0F}
            -------------------------------
            {atob(item.hmacSig).charCodeAt(-1) & 0x0F}
            */
            /*
            TOTPListNew[idx].asciiHash = atob(arrayBufferToBase64(TOTPListNew[idx].hmacSig))

            console.log('ASCII hash')
            console.log(TOTPListNew[idx].asciiHash)

            TOTPListNew[idx].lastByte = TOTPListNew[idx].asciiHash.at(-1).charCodeAt(0)

            TOTPListNew[idx].offset = TOTPListNew[idx].lastByte & 0x0F;

            // & 0x0F

            //Setp 7: Trucated Hash
            TOTPListNew[idx].truncatedHashAscii = TOTPListNew[idx].asciiHash.slice(TOTPListNew[idx].offset, (TOTPListNew[idx].offset + 4))

            TOTPListNew[idx].truncatedByte1 = TOTPListNew[idx].truncatedHashAscii.charCodeAt(0)
            TOTPListNew[idx].truncatedByte2 = TOTPListNew[idx].truncatedHashAscii.charCodeAt(1)
            TOTPListNew[idx].truncatedByte3 = TOTPListNew[idx].truncatedHashAscii.charCodeAt(2)
            TOTPListNew[idx].truncatedByte4 = TOTPListNew[idx].truncatedHashAscii.charCodeAt(3)

            //Step 8: Long TOTP Code
            TOTPListNew[idx].longTOTPCode = 0
            for (let i = 0; i < 3; i++) {
                // Convert each character to its ASCII value and concatenate
                TOTPListNew[idx].longTOTPCode += TOTPListNew[idx].truncatedHashAscii.charCodeAt(i);
            }

            let encoder = new TextEncoder();
            let encodedHashArray = encoder.encode(TOTPListNew[idx].truncatedHashAscii)
            //console.log(encodedHashArray)
            let buffer = encodedHashArray.buffer;
            let view = new DataView(buffer);
            TOTPListNew[idx].longTOTPCode = view.getUint32(0);

            

            //Step 9: Short TOTP Code
            TOTPListNew[idx].shortTOTPCode = TOTPListNew[idx].longTOTPCode & 0x7FFFF;
            TOTPListNew[idx].shortTOTPCode = TOTPListNew[idx].longTOTPCode % (10 ** 6);

            //Step 10: Formatting
            TOTPListNew[idx].shortTOTPCodeFormatted = TOTPListNew[idx].shortTOTPCode.toString().padStart(6, '0');
            */
        }
        
        //try {
        setTOTPList(TOTPListNew)
        //} catch {
        //return TOTPListNew
        //}

        

        //(new Date(currTimeEpoch + (item.timeOffset * 1000))).toUTCString()

        /*
        <div id="name-tag">
                            {item.name}
                        </div>
                        <div id="totp-code-tag">
                            {item.shortTOTPCodeFormatted.slice(0, 3)}-{item.shortTOTPCodeFormatted.slice(3, 6)}
                        </div>
                        <div id="more-details-tag">
                            <Button variant="info" onClick={() => {setOpenIntervalTabNo(item.id)}}><i class="bi bi-arrow-down-circle"></i></Button>
                        </div>
                        <div id="more-details-area">
                            {renderIntervalMoreDetails(item)}
                        </div>
                        */

    }

    function updateCurrentTime() {
        const currTime = new Date()
        //const utcStr = currTime.toUTCString()

        const epochTime = currTime.timestamp()

        return epochTime
    }

    function renderBits(number) {
        const binaryString = number.toString(2).padStart(8, '0');
        const bits = binaryString.split('');

        return (
            <div style={{ display: 'flex', gap: '2px' }}>
            {bits.map((bit, index) => (
                <div
                key={index}
                style={{
                    border: '1px solid black',
                    padding: '0px',
                    width: '20px',
                    textAlign: 'center',
                    fontFamily: 'monospace'
                }}
                >
                {bit}
                </div>
            ))}
            </div>
        );

    }

    function renderBytes(byteUint8Array) {
        //const binaryString = number.toString(2).padStart(8, '0');
        //const bits = binaryString.split('');
        const byteArray = Array.from(byteUint8Array)

        return (
            <div style={{ display: 'flex', gap: '2px' }}>
            {byteArray.map((bit, index) => (
                <div
                key={index}
                style={{
                    border: '1px solid black',
                    padding: '0px',
                    width: '50px',
                    textAlign: 'center',
                    fontFamily: 'monospace'
                }}
                >
                {bit}
                </div>
            ))}
            </div>
        );

    }

    function renderIntervalMoreDetails(item) {
        if (openIntervalTabNo === item.id || (1 === 1)) {
            return (
                <>
                    <div>

                        <h4>Part 1: Calculate Hop Count</h4>
                        <p>Calculate the number of 30 second intervals (hops) since <b>Epoch Time</b> (midnight Jan 1, 1970 UTC) to <b>{item.name}</b>.</p>
                        
                        <span><b>Time ({item.name}):</b> {item.strTime}</span><br/>

                        <span><b>Time since Epoch:</b> {(item.epochTime / 1000)} seconds</span><br/>

                        <b>Hop Count</b> = Time Since Epoch / 30 seconds <br/> 
                                  = {(item.epochTime / 1000)} seconds / 30 seconds <br/>
                                  = {item.hopCount}
                        <br/>
                        <br/>
                        <h4>Part 2: HMAC-SHA1 Hash</h4>
                        <p>Calculate the HMAC-SHA1 hash of the <b>Hop Count</b> using the <b>Secret Key</b>.</p>
                        <b>Hop Count: </b> {item.hopCount}<br/>
                        <b>Secret Key: </b> {secretKeyValue}<br/>
                        <br/>
                        <b>HMAC-SHA1 Hash (Base64):</b> HMAC-SHA1(Secret Key, Hop Count) <br/>
                        = {arrayBufferToBase64(item.hmacSig)} <br/>
                        <br/>
                        {renderBytes(item.hmacSig)}
                        <br/>
                        <h4>Part 3: Calculate Offset</h4>
                        <p>Offset is the <b>last 4 bits of the above HMAC-SHA1 hash.</b></p>
                        <b>Last Byte of HMAC-SHA1:</b> {item.lastByte}   {renderBits(item.lastByte)}
                        <br/>
                        <b>Offset:</b> Extract last 4 bits of last byte<br/>
                        = Last Byte & 0x0F<br/> 
                        = {item.lastByte} & 0x0F<br/> 
                        = {item.offset}       <br/>
                        {renderBits(item.offset)}
                        <br/>
                        <br/>

                        <h4>Part 4: Truncated Hash</h4>
                        <p>Truncated Hash is a 4 byte extraction of the HMAC-SHA1 hash starting from the Offset index.</p>

                        Full HMAC-SHA1 Hash (Byte Array):
                        {renderBytes(item.hmacSig)}
                        <br/>
                        Truncated Hash = SHA1-Hash[Offset: (Offset + 4)] <br/>
                                       = SHA1-Hash[{item.offset} : ({item.offset} + 4)] <br/>
                                       = SHA1-Hash[{item.offset} : {item.offset + 4}] <br/>
                                       {renderBytes(item.truncatedBytes)}
                        <br/>
                        <br/>
                        <h4>Part 5: Long TOTP Code</h4>
                        <p>Long TOTP code calculated by representing the <b>4-byte Truncated Hash</b> as a single <b>Unsigned 32-bit Integer</b>.</p>
                        {renderBytes(item.truncatedBytes)}

                        <b>Long TOTP Code:</b> {item.longTOTPCode}<br/>

                        <br/>
                        <br/>

                        <h4>Part 6: Short TOTP Code</h4>
                        <p>Extract only the last 6 digits for standard TOTP authenticator format.</p>

                        <b>Short TOTP Code:</b> {item.shortTOTPCodeFormatted} <br/>
                    </div>
                </>
            )
        }

    }

    function renderIntervals() {
        return (
            TOTPList.map((item) => (
                <>
                    <Accordion.Item class="interval-item" id={"interval-id" + item.id} eventKey={item.id}>
                        <Accordion.Header><div style={{border: '1px solid #000', borderRadius: '5px', width: '75px'}}><i class="bi bi-clock"></i> {item.name}</div>     <b>{item.shortTOTPCodeFormatted.slice(0, 3)} {item.shortTOTPCodeFormatted.slice(3, 6)}</b></Accordion.Header>
                        <Accordion.Body>
                            {renderIntervalMoreDetails(item)}
                        </Accordion.Body>
                    </Accordion.Item>
                </>
            ))
        )
    }

    function QRCodeModal() {
        return (
            <>
                <Modal show={QRDetailsModalShow} onHide={(event) => {setQRDetailsModalShow(false)}}>
                    <Modal.Header closeButton>
                    <Modal.Title>QR Code Content</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{textWrap: 'wrap', textWrapStyle: 'pretty', overflowWrap:'break-word'}}><div><p>{QRTextValue}</p></div></Modal.Body>
                </Modal>
            </>
        )
    }

    //-------------------------------------------------------------------------
    // RENDERING SECTION

    return (
        <>
            <section style={{backgroundColor: '#2a2a2a', paddingTop:'20px', paddingBottom: '20px'}}>
                <Container>
                    <link rel="stylesheet" href="/css/totp-tool.css"></link>
                    <h2>Time-Based One Time Passwords</h2>
                
                    <div id="totp-tool-container">
                        <div id="generating-qr-code" style={{paddingTop: '10px', paddingBottom: '30px'}}>
                            <h3><i class="bi bi-sliders"></i> Configuration</h3>

                            

                            <div id="otp-secret">
                                <div id="qr-code">
                                    <div id="otp-qr-code">
                                        <img src={QRImgValue} width="100%" height="100%"></img>
                                    </div>
                                    <div style={{textAlign: 'center', paddingTop: '5px'}}>
                                        <Button variant="outline-light" onClick={(event) => {setQRDetailsModalShow(true)}}><i class="bi bi-plus"></i>QR Code Content</Button>
                                    </div>
                                    {QRCodeModal()}
                                </div>
                                <div id="key-section">
                                    <div id="totp-qr-name">
                                        <b>Issuer:</b><input type="text" value={providerName} onChange={(event) => {setProviderName(event.target.value)}}></input>
                                    </div>
                                    <div id="totp-qr-username">
                                    <b>Username:</b><input type="text" value={QRUsername} onChange={(event) => {setQRUsername(event.target.value)}}></input>
                                    </div>
                                    <div id="secret-key-text">
                                        <b>Secret Key (Base 32): </b><span id="otp-secret-code"><input type="text" value={secretKeyValue} onChange={(event) => {handleNewKey(event.target.value)}}></input></span><br/>
                                    </div>
                                    <div class="errorBox">
                                        <span></span>
                                    </div>
                                    <div id="key-update-buttons">
                                        <Button variant="light" onClick={clickGenerateSecretKey}><i class="bi bi-arrow-repeat"></i> Generate</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="totp-calculator">
                            <h3>Valid Codes</h3>
                            <div>
                                <div>
                                    <span><i class="bi bi-clock"></i> {(new Date(currTimeEpoch)).toUTCString()} (UTC)</span>
                                </div>
                                <div>
                                    <Accordion>
                                        {renderIntervals()}
                                    </Accordion>
                                </div>
                            </div>

                        </div>
                    </div>
                </Container>
            </section>
        </>
    )
}
