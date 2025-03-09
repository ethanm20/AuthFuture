import Button from 'react-bootstrap/Button';
import { GenerateBase32SecretKey } from './utilities/generate-base-32-key';
import { useState } from 'react';

export function TOTPTool() {
    const [secretKeyValue, setSecretKey] = useState('aaa');

    const [QRTextValue, setQRTextValue] = useState('bbb');

    const [currTimeValue, setCurrTimeValue] = useState(new Date())

    const [currTimeStr, setCurrTimeStr] = useState(currTimeValue.toUTCString())

    function clickGenerateSecretKey() {
        var randomKey = GenerateBase32SecretKey()

        return null;
    }

    function clickValidate2FA() {
        return null;
    }

    function currentTimeString() {
        const currTime = new Date()
        const utcStr = currTime.toUTCString()
        return utcStr
    }


    return (
        <>
        <script src="https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js"></script>
        <link rel="stylesheet" href="/css/totp-tool.css"></link>


        <h2>Time-Based One Time Password (TOTP) Tool</h2>
        
        <div id="totp-tool-container">
            <div id="generating-qr-code">
                <h3>Step 1: Generate Secret Key</h3>

                

                <div id="otp-secret">
                    <div id="qr-code">
                        <div id="otp-qr-code"></div>
                        <div id="qr-code-text"><span id="otp-qr-code-text">{QRTextValue}</span></div>
                    </div>
                    <div id="key-section">
                        <div id="secret-key-text">
                            <b>Secret Key (Base 32): </b><span id="otp-secret-code"><input type="text" value={secretKeyValue}></input></span><br/>
                        </div>
                        <div class="errorBox">
                            <span></span>
                        </div>
                        <div id="key-update-buttons">
                            <Button variant="secondary" onClick={clickGenerateSecretKey()}>Randomly Generate</Button><Button variant="primary">Submit</Button>
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
                        <span>Calculating OTP codes for T-90 to T+90 seconds with 30 second intervals.</span>
                    </div>
                </div>

            </div>
        </div>
        </>
    )
}
