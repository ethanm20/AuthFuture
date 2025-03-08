import Button from 'react-bootstrap/Button';
import { GenerateBase32SecretKey } from './utilities/generate-base-32-key';

export function TOTPTool() {
    this.secretKeyState = {value: 'aaa'};

    function clickGenerateSecretKey() {
        var randomKey = GenerateBase32SecretKey()

        return null;
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
                        <div id="qr-code-text"><span id="otp-qr-code-text">Null</span></div>
                    </div>
                    <div id="key-section">
                        <div id="secret-key-text">
                            <b>Secret Key (Base 32): </b><span id="otp-secret-code"><input type="text" value={this.secretKeyState.value}></input></span><br/>
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


            </div>
        </div>
        </>
    )
}
