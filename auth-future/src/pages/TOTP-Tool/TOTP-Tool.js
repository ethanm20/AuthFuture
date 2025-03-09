import Button from 'react-bootstrap/Button';
import { GenerateBase32SecretKey } from './utilities/generate-base-32-key';
import { useState, useEffect } from 'react';

export function TOTPTool() {
    const [secretKeyValue, setSecretKey] = useState(GenerateBase32SecretKey());

    const [QRImgValue, setQRImgValue] = useState('bbb');

    const [QRTextValue, setQRTextValue] = useState('bbb');

    const [currTimeValue, setCurrTimeValue] = useState(new Date())

    const [currTimeStr, setCurrTimeStr] = useState(currTimeValue.toUTCString())

    const [openIntervalTabNo, setOpenIntervalTabNo] = useState(-1)

    const initialTOTPList = [
        {'id': 0,
        'name': 'T-90'
        },
        {'id': 1,
        'name': 'T-60'
        },
        {'id': 2,
        'name': 'T-30'
        },
        {'id': 3,
        'name': 'T-0'
        },
        {'id': 4,
        'name': 'T+30'
        },
        {'id': 5,
        'name': 'T+60'
        }, 
        {'id': 6,
        'name': 'T+90'
        }
    ]

    const [TOTPList, setTOTPList] = useState(initialTOTPList)

    //Updates both QR Image and Text
    function updateQRTextImage() {
        let qrCodeLabel = 'AuthFuture';
        let qrCodeEmail = "username";
        let qrCodeSecret = secretKeyValue;  
        let qrCodeDigits = 6;
        let qrCodePeriod = 30;
        let qrCodeStr = 'otpauth://totp/' + qrCodeLabel + ':' + qrCodeEmail + '?secret=' + qrCodeSecret + '&issuer=' + qrCodeLabel + '&digits=' + qrCodeDigits + '&period=' + qrCodePeriod;
        
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
    }, [secretKeyValue])
    
    function clickGenerateSecretKey() {
        const randomKey = GenerateBase32SecretKey()

        setSecretKey(randomKey)


    }

    function clickValidate2FA() {
        return null;
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
        //Update time
        setCurrTimeStr(currentTimeString())


    }

    function currentTimeString() {
        const currTime = new Date()
        const utcStr = currTime.toUTCString()
        return utcStr
    }

    function renderIntervalMoreDetails(item) {
        if (openIntervalTabNo === item.id) {
            return (
                <>
                    <div>
                        <h4>Step 1: Get Time For {item.name}</h4>
                        <span>Time ({item.name}): </span>

                        <h4>Step 2: Convert Time to Epoch Time</h4>
                        <span>We now calculate Epoch UNIX time. (Number of seconds since midnight January 1st 1970)</span>
                        Epoch Time Value: 

                        <h4>Step 3: Divide this Time by the Interval (30 Seconds)</h4>
                        Hop Count = Epoch Time Value / 30 seconds = 

                        <h4>Step 4: Encode as a Long Long Integer</h4>
                        Hop Count (as Bytes) = 

                        <h4>Step 5: Get HMAC-SHA1 hash of Secret Key and Hop Count Bytes</h4>
                        HMAC-SHA1 Hash: 

                        <h4>Step 6: Calculate Offset</h4>
                        Offset Value:

                        <h4>Step 7: Truncated Hash</h4>
                        Truncated Hash = SHA1-Hash[Offset: (Offset + 4)]

                        <h4>Step 8: Long TOTP Code</h4>

                        <h4>Step 9: Short TOTP Code</h4>
                        We only want the last 6 digits

                        <h4>Step 10: Formatting</h4>
                        Pad with zeros if value is less than 1000
                    </div>
                </>
            )
        }

    }

    function renderIntervals() {
        return (
            TOTPList.map((item) => (
                <>
                    <div class="interval-item">
                        <div id='id-tag'>
                            {item.id}
                        </div>
                        <div id="name-tag">
                            {item.name}
                        </div>
                        <div id="totp-code-tag">
                            000-000
                        </div>
                        <div id="more-details-tag">
                            <Button variant="info" onClick={() => {setOpenIntervalTabNo(item.id)}}>Details</Button>
                        </div>
                        <div id="more-details-area">
                            {renderIntervalMoreDetails(item)}
                        </div>
                    </div>
                </>
            ))
        )
    }

    //-------------------------------------------------------------------------
    // RENDERING SECTION

    return (
        <>
        <link rel="stylesheet" href="/css/totp-tool.css"></link>


        <h2>Time-Based One Time Password (TOTP) Tool</h2>
        
        <div id="totp-tool-container">
            <div id="generating-qr-code">
                <h3>Step 1: Generate Secret Key</h3>

                

                <div id="otp-secret">
                    <div id="qr-code">
                        <div id="otp-qr-code">
                            <img src={QRImgValue} width="100%" height="100%"></img>
                        </div>
                        <span id="otp-qr-code-text"></span>
                        <div id="qr-code-text">{QRTextValue}</div>
                    </div>
                    <div id="key-section">
                        <div id="secret-key-text">
                            <b>Secret Key (Base 32): </b><span id="otp-secret-code"><input type="text" value={secretKeyValue}></input></span><br/>
                        </div>
                        <div class="errorBox">
                            <span></span>
                        </div>
                        <div id="key-update-buttons">
                            <Button variant="secondary" onClick={clickGenerateSecretKey}>Randomly Generate</Button><Button variant="primary">Submit</Button>
                        </div>
                    </div>
                </div>
            </div>
            <div id="validate-totp">
                <h3>Step 2: Validate 6 Digit Code</h3>

                <div>
                    <span>Validating against Secret Key: </span>{secretKeyValue}
                </div>

                <div>
                    <span>Please enter 6 digit 2FA code: </span><input type="text"></input>
                    <Button variant="primary" onClick={clickValidate2FA}>Submit</Button>
                </div>

            </div>
            <div id="totp-calculator">
                <h3>Calculations</h3>
                <div>
                    <div>
                        <span>Secret Key is: {secretKeyValue}</span>
                    </div>
                    <div>
                        <span>The current UTC time is: {currTimeStr}</span>
                    </div>
                    <div>
                        <span>Calculating OTP codes for T-90 to T+90 seconds with 30 second intervals (as the time clock on the authenticator device may be slightly out of sync).</span>
                    </div>
                    <div>
                        {renderIntervals()}
                    </div>
                </div>

            </div>
        </div>
        </>
    )
}
