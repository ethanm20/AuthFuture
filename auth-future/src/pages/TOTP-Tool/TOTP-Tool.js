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
                    <div id="otp-qr-code"></div>
                    
                    <b>Secret Key: </b><span id="otp-secret-code"></span><br/>
                    <b>QR Code Content: </b><span id="otp-qr-code-text"></span>
                    <input type="text"></input>
                    <Button variant="primary">Randomly Generate</Button>
                </div>
            </div>
        </div>
        </>
    )
}
