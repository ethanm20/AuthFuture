import Button from 'react-bootstrap/Button';

export function TOTPTool() {
    return (
        <>
        <h2>Time-Based One Time Password (TOTP) Tool</h2>
        
        <div id="totp-tool-container">
            <div id="generating-qr-code">
                <h3>Step 1: Generate Secret Key</h3>

                <script src="https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js"></script>

                <div id="otp-secret">
                    <div id="qr-code">
                        <div id="otp-qr-code"></div>
                        <b>QR Code Content: </b><span id="otp-qr-code-text"></span>
                    </div>
                    <div id="key-section">
                        <b>Secret Key (Base 32): </b><span id="otp-secret-code"><input type="text"></input></span><br/>
                        <Button variant="secondary">Randomly Generate</Button>

                        <Button variant="primary">Submit</Button>
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
