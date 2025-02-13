import { renderConfiguredBiometrics } from "./register.js";
import { arrayBufferToBase64, Base64Binary } from "./helpers.js";

/* Function Requests Settings for a New Credential and Registers it and Sends to Server */
export function newBiometricCredentialRequest(email, name) {
    fetch('/auth/registerRequest', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'email': email
        })
    })
    .then(
        response => response.text()
    )
    .then (
        response => JSON.parse(response)
    )
    .then((data) => {
        // Got the Options from Server for Registering new WebAuthn passkey
        console.log('Biometric Credential Response');
        console.log(data);
        return data;
    })
    .then((data) => {
        // Actually Registering the new Passkey with the user
        return getPublicKeyFromUser(data);
    })
    .then ((response) => {
        // Sending the Attestation Response (from the passkey) to the server
        return sendAttestationResponsetoServer(response, email, name);
    })
    .then(
        response => response.text()
    )
    .then((httpResponse) => {
        // Updating the list of Biometric Credentials on the Screen
        alert(httpResponse);
        renderConfiguredBiometrics();
    })
    .catch((error) => {
      alert(error);
    })
    
}

/* Using the Options from the Server, Registers a New Credential via User's OS */
function getPublicKeyFromUser(options) {
    options['publicKey']['challenge'] = Base64Binary.decode(options['publicKey']['challenge']);
    options['publicKey']['user']['id'] = Base64Binary.decode(options['publicKey']['user']['id']);

    return navigator.credentials.create(options);
}

/* The Attestation Response after Registering New Credential is Sent to Server */
function sendAttestationResponsetoServer(response, email, name) {
    console.log('SEND ATTESTATIONS');
    //console.log(response.getPublicKey())
    console.log('CREDENTIAL ID');
    console.log(response.id);
    let credentialID = arrayBufferToBase64(response.rawId);
    console.log(credentialID);

    console.log('To JSON');
    console.log(arrayBufferToBase64(response.response.clientDataJSON));

    response = response.response;

    console.log("Public Key");
    console.log(response.getPublicKey());

    //console.log('ATTESTATION OBJECT');
    //console.log(CBOR.decode(response.attestationObject));
    let payload = {
        'email': email,
        'name': name,
        'credentialId': credentialID, 
        'attestationResponseObj': Array.from(new Uint8Array(response.attestationObject)),
        'clientDataJSON': arrayBufferToBase64(response.clientDataJSON),
        'authenticatorData': Array.from(new Uint8Array(response.getAuthenticatorData())),
        'publicKey': arrayBufferToBase64(response.getPublicKey()),
        //'publicKey': Array.from(new Uint8Array(response.getPublicKey())),
        'alg': response.getPublicKeyAlgorithm(),
        'transports': response.getTransports()
    }

    return fetch('/auth/registerResponse', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
}



