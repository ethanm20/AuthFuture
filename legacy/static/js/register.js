import { newBiometricCredentialRequest } from "./biometricsRegistration.js";
import { setCookie, deleteCookie } from "./helpers.js";

let screenStepOne = document.querySelector('#screen-register-step-one');

let screenTempCode = document.querySelector('#screen-temp-code');
screenTempCode.style.display = 'none';

let registerOTPForm = document.querySelector('#register-step-one-form');

let registerOTPCodeForm = document.querySelector('#register-otp-code-form');

let totpCodes = [];

// STEP 1 / STEP 2
// When Step 1 Form Submitted, Load Step 2 (Including Getting the TOTP Secret Key & Rendering the QR Code)
registerOTPForm.addEventListener('submit', (event) => {
    event.preventDefault();
    fetch('/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            'firstName': document.querySelector('#register-firstname-field').value,
            'lastName': document.querySelector('#register-lastname-field').value,
            'email': document.querySelector('#register-email-field').value,
            'password': document.querySelector('#register-password-field').value
        })
    })
        .then((response) => {
            return response.text();
        })
        .then((data) => {
            // Setting the Session Cookies After Step 1 Complete
            alert("Successfully Added User");
            data = JSON.parse(data);
            let hrsToExpiry = Date.parse(data['expTime']) - Date.now();
            hrsToExpiry = hrsToExpiry / (1000 * 60 * 60);
            console.log('hrsToExpiry');
            console.log(hrsToExpiry);
            deleteCookie('secureAuthToken');
            deleteCookie('secureAuthEmail');
            setCookie('secureAuthToken', data['token'], hrsToExpiry);

            screenStepOne.style.display = 'none';
            screenTempCode.style.display = 'block';
            let email = document.querySelector('#register-email-field').value;
            setCookie('secureAuthEmail', email, hrsToExpiry);
            return retrieveOTPDetails(email);
        })
        .then((otpDetailsResponse) => {
            return otpDetailsResponse.text();
        })
        .then(otpDetailsData => JSON.parse(otpDetailsData))
        .then((otpDetailsData) => {
            // Step 2 details have been returned
            // Render Step 2 and Build the QR Code
            totpCodes = otpDetailsData;
            document.querySelector('#otp-secret #otp-secret-code').innerText = otpDetailsData[0]['secretKey'];
            let qrCodeLabel = 'slackr';
            let qrCodeEmail = document.querySelector('#register-email-field').value;
            let qrCodeSecret = otpDetailsData[0]['secretKey'];  
            let qrCodeDigits = 6;
            let qrCodePeriod = 30;
            let qrCodeStr = 'otpauth://totp/' + qrCodeLabel + ':' + qrCodeEmail + '?secret=' + qrCodeSecret + '&issuer=' + qrCodeLabel + '&digits=' + qrCodeDigits + '&period=' + qrCodePeriod;
            document.querySelector('#otp-qr-code-text').innerText = qrCodeStr;
            new QRCode(document.querySelector("#otp-qr-code"), qrCodeStr);

            // Rendering the Calculation Details
            renderCalculationDetails(otpDetailsData);
            //document.querySelector('#register-otp-calculation-details').innerText = otpDetailsData;
        })
        .catch((error) => {
            alert(error);
        });
});

// Gets the TOTP Details for Step 2
function retrieveOTPDetails(email) {
    return fetch('/register-steptwo', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            'email': document.querySelector('#register-email-field').value
        })
    })
}

// Renders the Calculation Box for Step 2
function renderCalculationDetails(data) {
    let otpCalcDetails = document.querySelector('#register-otp-calculation-details');
    data.forEach((otp) => {
        let otpContainer = document.createElement('div');
        otpContainer.setAttribute('class', 'otp-container');

        let totpCode = document.createElement('div');
        totpCode.setAttribute('class', 'totp-code');
        totpCode.innerText = otp['TOTPcode'];
        otpContainer.appendChild(totpCode);

        let hmacHash = document.createElement('div');
        hmacHash.setAttribute('class', 'hmac-hash');
        hmacHash.innerText = 'SHA-256 HMAC hash of the secret key ' + otp['secretKey'] + ' and ' + '= ' + otp['HMACHash'];
        otpContainer.appendChild(hmacHash);

        let truncatedHash = document.createElement('div');
        truncatedHash.setAttribute('class', 'truncated-hash');
        truncatedHash.innerText = 'Truncated hash = ' + otp['truncatedHash'];
        otpContainer.appendChild(truncatedHash);

        otpCalcDetails.appendChild(otpContainer);
    })
}

let calculationBoxHeading = document.querySelector('#calculation-box #calculation-box-heading');
calculationBoxHeading.addEventListener('click', () => {
    let calcBoxDetails = document.querySelector('#calculation-box #calculation-box-details');
    if (calcBoxDetails.style.display === 'block') {
        calcBoxDetails.style.display = 'none';
    } else {
        calcBoxDetails.style.display = 'block';
    }
})

//Register OTP Submit 
// When user enters the TOTP code
// Checks the TOTP code is one of the 7 valid codes
registerOTPCodeForm.addEventListener('submit', (event) => {
    event.preventDefault();
    let found = false;
    let otpCode = document.querySelector('#register-otp-code-form #register-otp-field').value;
    totpCodes.forEach((code) => {
        if (code['TOTPcode'] === otpCode) {
            found = true;
        }
    })

    if (found === true) {
        alert('TOTP Code Successfully Verified');
        document.querySelector('#screen-temp-code').style.display = 'none';
        document.querySelector('#biometrics-screen').style.display = 'block';
        renderConfiguredBiometrics();
    } else {
        alert('TOTP Code is Incorrect')
    }
});

// STEP 3

//When Clicking Add Biometric
// a small form appears to give it a name
let addBiometricsForm = document.querySelector('#add-biometric-credentials-form');
let addBiometricCredentialBtn = document.querySelector('#biometrics-screen #add-biometric-credentials');
addBiometricCredentialBtn.addEventListener('click', () => {
    addBiometricsForm.style.display = 'flex';
    addBiometricCredentialBtn.style.display = 'none';
    
});

// When the user clicks submit after giving the new credential a name, now OS will need to make the credential
addBiometricsForm.addEventListener('submit', (event) => {
    event.preventDefault();
    newBiometricCredentialRequest(document.querySelector('#register-email-field').value, document.querySelector('#add-biometric-credentials-form #new-biometric-credential-name').value);
    addBiometricsForm.style.display = 'none';
});

let addBiometricsFormCloseBtn = document.querySelector('.add-biometric-credentials-form-top-row i');
addBiometricsFormCloseBtn.addEventListener('click', () => {
    addBiometricsForm.style.display = 'none';
})

//List Configured Biometrics
// Lists all Biometric Credentials already linked to account
export function renderConfiguredBiometrics() {
    fetch('/auth/getBiometricCredentials', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            'email': document.querySelector('#register-email-field').value
        })
    })
    .then((response) => {
        return response.text()
    })
    .then((data) => {
        data = JSON.parse(data);

        let biometricCredentialsList = document.querySelector('#list-biometric-credentials');
        while (biometricCredentialsList.firstChild) {
            biometricCredentialsList.removeChild(biometricCredentialsList.lastChild);
        }

        data.forEach((biometricCredential, index) => {
            let biometricCredentialContainer = document.createElement('div');
            biometricCredentialContainer.setAttribute('class', 'biometric-credential-container');
            biometricCredentialContainer.setAttribute('credential-index', index);

            let biometricCredentialName = document.createElement('div');
            biometricCredentialName.setAttribute('class', 'biometric-credential-name');
            biometricCredentialName.innerText = biometricCredential;

            let biometricCredentialDelete = document.createElement('button');
            biometricCredentialDelete.setAttribute('class', 'biometric-credential-delete-btn');
            biometricCredentialDelete.addEventListener('click', () => {
                deleteBiometricCredential(biometricCredentialContainer.getAttribute('credential-index'));
            })


            biometricCredentialContainer.appendChild(biometricCredentialName);
            biometricCredentialContainer.appendChild(biometricCredentialDelete);

            biometricCredentialsList.appendChild(biometricCredentialContainer);
        })
        // document.querySelector('#biometrics-screen #add-biometric-credentials').style.display = 'block';

    });
}

// Deletes a credential given the index, and then re-renders the list of configured biometrics
function deleteBiometricCredential(index) {
    fetch('/auth/deleteBiometricCredential', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            'email': document.querySelector('#register-email-field').value,
            'index': index
        })
    }).then((response) => {
        return response.text()
    })
    .then((data) => {
        alert(data)
        renderConfiguredBiometrics()
    })
}

// Submitted Biometric Credentials
// If there are no more biometrics to add go to dashboard
let submitBiometricCredentialsBtn = document.querySelector('#biometrics-screen #finish-biometric-credentials-btn');
submitBiometricCredentialsBtn.addEventListener('click', () => {
    let domain = window.location.origin
    window.location.replace(domain + '/dashboard');
})


