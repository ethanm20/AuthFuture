import {Button, Container, Modal} from 'react-bootstrap';

import Accordion from 'react-bootstrap/Accordion';

import { GenerateBase32SecretKey } from './utilities/generate-base-32-key';
import { useState, useEffect } from 'react';

import base64 from 'crypto-js/enc-base64';

import hmac from 'crypto-js/hmac-sha256';

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

    function updateTOTPCalculation() {
        //Update global time
        const timeEpoch = Date.now()
        setCurrTimeEpoch(timeEpoch)

        let TOTPListNew = []

        const TOTPTimeOffsets = [-90, -60, -30, 0, 30, 60, 90]

        TOTPTimeOffsets.forEach((item, idx) => {
            //Step 0 Initialisation
            TOTPListNew.push({
                'id': idx,
                'name': 'T' + parseInt(item),
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
                'longTOTPCode': null,
                'shortTOTPCode': null,
                'shortTOTPCodeFormatted': null
            })

            //Step 1 & Step 2: Update Time for Item
            TOTPListNew[idx].strTime = new Date(TOTPListNew[idx].epochTime).toUTCString()

            //Step 3: Update Hop Count
            TOTPListNew[idx].hopCount = parseInt((TOTPListNew[idx].epochTime / 1000) / 30)

            //Step 4: Encode hop count as long long int


            //Step 5: HMAC Hash
            TOTPListNew[idx].hmacSig = hmac(TOTPListNew[idx].hopCount.toString(), secretKeyValue);
            let binaryStr = atob(TOTPListNew[idx].hmacSig.toString(base64))



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

            /*
            ------------------------------
            {item.hmacSig.toString(base64).slice(-1)}
            |------------------------------
            {atob(item.hmacSig).at(-1).charCodeAt(0) & 0x0F}
            -------------------------------
            {atob(item.hmacSig).charCodeAt(-1) & 0x0F}
            */

            TOTPListNew[idx].asciiHash = atob(TOTPListNew[idx].hmacSig)

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
            console.log(encodedHashArray)
            let buffer = encodedHashArray.buffer;
            let view = new DataView(buffer);
            TOTPListNew[idx].longTOTPCode = view.getUint32(0);

            

            //Step 9: Short TOTP Code
            TOTPListNew[idx].shortTOTPCode = TOTPListNew[idx].longTOTPCode & 0x7FFFF;
            TOTPListNew[idx].shortTOTPCode = TOTPListNew[idx].longTOTPCode % (10 ** 6);

            //Step 10: Formatting
            TOTPListNew[idx].shortTOTPCodeFormatted = TOTPListNew[idx].shortTOTPCode.toString().padStart(6, '0');

        })
        
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

    function renderIntervalMoreDetails(item) {
        if (openIntervalTabNo === item.id || (1 === 1)) {
            return (
                <>
                    <div>
                        <h4>Step 1: Get Time For {item.name}</h4>
                        <span>Time ({item.name}): {item.strTime}</span>

                        <h4>Step 2: Convert Time to Epoch Time</h4>
                        <span>We now calculate Epoch UNIX time. (Number of seconds since midnight January 1st 1970)</span>
                        Epoch Time Value: {(item.epochTime / 1000)}

                        <h4>Step 3: Divide this Time by the Interval (30 Seconds)</h4>
                        Hop Count = Epoch Time Value / 30 seconds = {item.hopCount}

                        <h4>Step 4: Encode as a Long Long Integer</h4>
                        Hop Count (as Bytes) = 

                        <h4>Step 5: Get HMAC-SHA1 hash of Secret Key and Hop Count Bytes</h4>
                        {item.decimal}<br/>
                        {item.hmacSig.toString(base64)}<br/>
                        HMAC-SHA1 Hash (Base64): {item.hmacSig.toString(base64)}
                        Binary: {Number(parseInt(item.hmacSig, 16))}
                        Bin 2: {Number(parseInt(item.hmacSig, 16)) & 0xFF}
                        Bin 3: {0 & 0xFF}
                        <h4>Step 6: Calculate Offset</h4>
                        HMAC-SHA1 Hash (Base64): {item.hmacSig.toString(base64)} <br/>
                        Decoding the Base64 Hash: {item.asciiHash} <br/>
                        Last Byte of Hash in Decimal is: {item.asciiHash.at(-1)} = {item.lastByte} <br/>
                        Offset Value: Last Byte & 0x0F = {item.lastByte} & 0x0F = 
                         {item.offset} 



                        <h4>Step 7: Truncated Hash</h4>
                        Decoded Base64 Hash: {item.asciiHash} <br/>

                        Truncated Hash = SHA1-Hash[Offset: (Offset + 4)] <br/>
                                       = SHA1-Hash[{item.offset} : ({item.offset} + 4)] <br/>
                                       = SHA1-Hash[{item.offset} : {item.offset + 4}] <br/>
                                       = {item.truncatedHashAscii}

                        <h4>Step 8: Long TOTP Code</h4>
                        Converting the 4 byte truncated hash to decimal for each byte
                        
                        Truncated Hash Characters = {item.truncatedHashAscii}<br/>

                        Decoding with ASCII to Decimal: {item.truncatedByte1} {item.truncatedByte2} {item.truncatedByte3} {item.truncatedByte4}<br/>

                        Long TOTP Code: {item.longTOTPCode}

                        <h4>Step 9: Short TOTP Code</h4>
                        We only want the last 6 digits<br/>

                        Short TOTP Code: {item.shortTOTPCode}

                        <h4>Step 10: Formatting</h4>
                        Pad with zeros if value is less than 1000

                        Final TOTP Code: {item.shortTOTPCodeFormatted}
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
                        <Accordion.Header>{item.name}   |  {item.shortTOTPCodeFormatted.slice(0, 3)}-{item.shortTOTPCodeFormatted.slice(3, 6)}</Accordion.Header>
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
