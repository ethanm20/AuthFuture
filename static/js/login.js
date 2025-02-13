import { verifyBiometrics } from "./biometricsLogin.js";

let stepOneToken = '';
let stepTwoToken = '';
let stepThreeToken = '';
let nextPage = '';

// STEP 1
// When the Username & Password is Submitted, Send Response to Server, Get Token and go to Step 2
let loginStepOneForm = document.querySelector('#login-step-one-form');
loginStepOneForm.addEventListener('submit', (event) => {
    event.preventDefault();
    
    fetch('/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            'email': loginStepOneForm.querySelector('#login-email-field').value,
            'password': loginStepOneForm.querySelector('#login-password-field').value,
        })
    })
        .then((response) => {
            return response.text();
        })
        .then((data) => {
            data = JSON.parse(data);
            stepOneToken = data['token'];
        })
        .then(() => {
            renderLoginStepTwo();
        })
        .catch((error) => {
            alert(error);
        });
});

function renderLoginStepTwo() {
    document.querySelector('#screen-login-step-one').style.display = 'none';
    document.querySelector('#screen-login-totp-code').style.display = 'block';
}

// STEP 2
// When the TOTP Code is Successfully Entered, Go To Step 3
let loginTOTPForm = document.querySelector('#screen-login-totp-code');
loginTOTPForm.addEventListener('submit', (event) => {
    event.preventDefault();
    submitTOTPForm(stepOneToken);
})

function submitTOTPForm(loginToken) {
    fetch('/login-totp', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            'email': document.querySelector('#login-email-field').value,
            'token': loginToken,
            'totp': document.querySelector('#login-otp-field').value
        })
    })
    .then((response) => {
        return response.text();
    })
    .then((data) => {
        data = JSON.parse(data);
        stepTwoToken = data['token'];
        renderLoginStepThree();
    })
    .catch((error) => {
        alert(error);
    });
}

function renderLoginStepThree() {
    document.querySelector('#screen-login-totp-code').style.display = 'none';
    document.querySelector('#screen-login-biometrics').style.display = 'block';
}

// STEP 3

// Verify the Biometrics & Login (in biometricsLogin.js)
let verifyBiometricsBtn = document.querySelector('#screen-login-biometrics #login-biometric-credentials-btn');
verifyBiometricsBtn.addEventListener('click', (event) => {
    event.preventDefault();
    verifyBiometrics(document.querySelector('#login-email-field').value, stepTwoToken);
})

/* Calculation Box */
let calculationBoxHeading = document.querySelector('#calculation-box #calculation-box-heading');
calculationBoxHeading.addEventListener('click', () => {
    let calcBoxDetails = document.querySelector('#calculation-box #calculation-box-details');
    if (calcBoxDetails.style.display === 'block') {
        calcBoxDetails.style.display = 'none';
    } else {
        calcBoxDetails.style.display = 'block';
    }
})


