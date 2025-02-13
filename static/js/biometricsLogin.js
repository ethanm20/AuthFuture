import { Base64Binary, arrayBufferToBase64, deleteCookie, setCookie } from "./helpers.js";

let credentialID = '';

/* Verifies Biometrics Entered */
export function verifyBiometrics(email, token) {
    fetch('/auth/checkBiometricRequest', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'email': email,
            'token': token
        })
    })
    .then((response) => {
        return response.text();
    })
    .then((data) => {
        // Getting Options from Server
        let options = JSON.parse(data);
        console.log('Biometric Data');
        console.log(data);
        options['publicKey']['challenge'] = Base64Binary.decode(options['publicKey']['challenge']);
        options['publicKey']['allowCredentials'][0]['id'] = Base64Binary.decode(options['publicKey']['allowCredentials'][0]['id']);
        console.log(options['publicKey']['allowCredentials'][0]['id']);

        // Getting the Credential from the User
        return navigator.credentials.get(options);
    })
    .then((assertion) => {
        console.log('authenticator response');  
        console.log(assertion.response);
        // Browser has Got Response
        // Now Send the Assertion to the Server
        return sendAssertionResponseToServer(assertion, token, email);
    })
    .then((serverResponse) => {
        return serverResponse.text();
    })
    .then((data) => {
        console.log(data);
        data = JSON.parse(data);

        // Update the Session Cookie and Now Send to Dashboard
        deleteCookie('secureAuthToken');
        deleteCookie('secureAuthEmail');
        setCookie('secureAuthToken', data['token'], 2);
        setCookie('secureAuthEmail', email, 2);

        let domain = window.location.origin
        window.location.replace(domain + '/dashboard');
    })
    .catch((error) => {
        alert("Biometric Credential does Not Match");
    });
}

/* Sends the Assertion Response To Server */
// Returns a Promise
function sendAssertionResponseToServer(assertion, token, email) {
    console.log('AUTH DATA');
    console.log(vanillaCBOR.decode(assertion.response.authenticatorData));
    return fetch('/auth/checkBiometricResponse', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'email': email,
            'stepTwoToken': token,
            'assertion' : {
                'signature': arrayBufferToBase64(assertion.response.signature),
                'authenticatorData': arrayBufferToBase64(assertion.response.authenticatorData),
                'clientDataJSON': arrayBufferToBase64(assertion.response.clientDataJSON)
            },
            'credentialId': arrayBufferToBase64(assertion.rawId)
        })
    })
}