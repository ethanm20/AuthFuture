import { NavigationBar } from "../../features/NavigationBar/NavigationBar";

export function WebAuthnDescription () {
    return (
        <>
        <div>
            <h3>What is WebAuthn?</h3>
            <p>
                WebAuthn is a very recent standard that is a core component of the FIDO2 project which is a collaboration between the FIDO Alliance and World Wide Web Consortium (W3C) standards bodies to create strong authentication for the web. The WebAuthn protocol is a protocol that can be activated through JavaScript that enables the browser to utilise a variety of methods to authenticate through the user's Operating System such as fingerprints, facial recognition, device PIN and USB security keys. WebAuthn is an extension of the relatively recent Credential Management API developed by W3C  in 2016 that enables frontend JavaScript to add/retrieve credentials through calling navigator.credentials.create() or navigator.credentials.get() respectively.  
            </p>
            <p>
                When registering for an account on a website, the user is prompted to create a "passkey", this opens up a dialog on the user's Operating System, prompting the user to select a passkey method, this could be simply their PIN/password/lock screen pattern, biometrics (i.e. their fingerprint or face) or it could be an external security mechanism such as a USB security key or an NFC/RFID card. 
            </p>
            <p>
                When logging in to the account, the website fetches the passkey used to register and the user is prompted to authenticate themselves by using the passkey method (PIN/Password/Fingerprint/FaceID/USB/NFC Card) that was used at registration.
            </p>
            <p>
                The purpose of WebAuthn is that these passkeys are both far more secure and easier from a User Experience standpoint than usernames and passwords and with WebAuthn being an open protocol, the aim is that WebAuthn will significantly mitigate against and reduce the number of online phishing attacks on the Internet. 
            </p>
        </div>
        <div>
            <h3>History of WebAuthn</h3>
            <p>
                <b>U2F Protocol (2014):</b> The U2F protocol was developed in 2014, but from 2015, Chrome, Firefox and Opera began supporting the U2F protocol which enabled USB security keys to be used as part of Multi Factor Authentication on web apps. The U2F protocol was first developed by the FIDO Alliance in 2014. 
            </p>
            <img src="/static/assets/yubico-security-key.jpg" />
            <p>
                <b>U2F Protocol Expansion (2015): </b> From 2015, the U2F protocol was updated to include support for NFC and Bluetooth as transport protocols over which U2F authentication could take place, essentially enabling support for NFC smartcards or Bluetooth tokens for authentication on web apps.
            </p>
            <p>
                <b>FIDO2 Project Development (2015): </b> In September 2015, the FIDO2 Project proposed specifications were released to include support for a wide variety of authenticators and authentication methods. It also specified a new Credential Management API, a signature format and an attestation format (for registering credentials). The FIDO2 project consists of the WebAuthn protocol (for web apps to interact with the browser) and the Client to Authenticator protocol (for roaming authenticators i.e. smartphones/USB security keys). 
            </p>
            <p>
                <b>WebAuthn Becomes a W3C Standard (2019): </b> In March 2019, the WebAuthn protocol was approved by the World Wide Web Consortium (W3C) and became an official standard of the web, paving the way for widespread browser support.
            </p>
            <p>
                <b>Apple FaceID/TouchID Compatible with WebAuthn (2020):</b> Apple users could use FaceID/TouchID on WebAuthn web apps from June 2020 in Safari.
            </p>
            <p>
                <b>Google Chrome Support (2022):</b> Whilst the desktop Chrome browser had WebAuthn support since before it became a W3C standard, only from October 2022 did the stable version of Chrome support WebAuthn on all platforms including notably Android OS.
            </p>
        </div>
        <div>
            <h3>How does WebAuthn work?</h3>
            <h4>Registering a new Passkey</h4>
            <p>
                <b>Step 1 (Account Creation): </b> The user must first enter their key details for the account (i.e. Name, Email), notably it is not mandatory for a user to set a password depending on if the implementation is MFA or passwordless. The user is then added to the backend database.
            </p>
            <p>
                <b>Step 2 (Retrieving Options to Register WebAuthn Passkey): </b> The user's browser now makes a request to the backend server to retrieve the options to register a new passkey.
            </p>
            <p>
                The most significant options retrieved are:
            </p>
            <ul>
                <li>Website Domain</li>
                <li>User ID: A random string (not the username)</li>
                <li>Challenge: A random One Time string that the user needs to return when they make the credential</li>
                <li>Exclude Credentials list: A list of IDs of the credentials already registered, so the user does not register the same passkey method.</li>
                <li>User Verification: If this is True, only biometric verification methods may be used.</li>
            </ul>
            <p>
                <b>Step 3 (Register a New WebAuthn Passkey): </b> The user's browser now registers its own passkey with the JS code calling the function navigator.credentials.create(options) with options being the options retrieved in the previous step.
            </p>
            <p>
                The user sends the credential details for the passkey created including:
            </p>
            <ul>
                <li>Credential ID</li>
                <li>Challenge: The same challenge sent by the server</li>
                <li>Public Key</li>
                <li>Credential Location: If it is external or an external method (as the credential would be stored on the USB or NFC card)</li>
                <li>Method Type: The server is notified that this is a CREATE credential method.</li>
                <li>Algorithm: A number representing which cryptographic algorithm was used for the public/private key.</li>
            </ul>
            <p>
                <b>Step 4 (Server Saving & Verifying Credential): </b> The server first verifies the challenge is the same and then saves the Credential ID, the Public Key and the Credential Method to the database for the user.
            </p>
            <p>
                Some implementations may conduct further verification checks such as verifying if the Public Key is from a reputable Certificate Authority such as Google, Microsoft or Apple. They may also conduct security checks on the origin to ensure that the request definitely was from the web browser and not via another domain.
            </p>
            <h4>Logging in with a Passkey</h4>
            <p>
                <b>Step 1 (Getting User ID): </b> In all implementations, the user must first enter some sort of unique identifier (i.e. Username or Email if passwordless) or enter their username and password for a MFA setup. 
            </p>
            <p>
                <b>Step 2 (Getting WebAuthn Login Options): </b> The user's browser must now request the server for the WebAuthn login options for the account.
            </p>
            <p>
                The details returned by the server include:
            </p>
            <ul>
                <li>Credentials: A list of Credential IDs that are linked to this account and their location (i.e. are they internal or external).</li>
                <li>Challenge: A unique challenge for this request the user needs to return.</li>
                <li>User ID: The unique User ID for this account.</li>
            </ul>
            <p>
                <b>Step 3 (User Finds Credential & Sends It): </b> Using the list of Credential IDs and their location, the user's browser finds the credential and prompts the user to verify (i.e. entering their PIN, using their fingerprint etc.).
            </p>
            <p>
                Once the user has verified, the Operating System can unlock the private key of the credential and will create a signature using the private key of the credential.
            </p>
            <p>
                The user's browser now sends the following to the server:
            </p>
            <ul>
                <li>Assertion Signature: Signature signed with the credential's private key. (This is comprised of the SHA-256 version of the clientDataJSON field & authenthenticatorData field combined)</li>
                <li>Challenge: The challenge sent by the server in the previous step.</li>
                <li>Method: As we are validating an existing credential we tell the server this is the GET method.</li>
            </ul>
            <p>
                <b>Step 4 (Server Verifies the Credential): </b> The server verifies the signature using the Public Key that it stored from registration and also verifies the challenge. If this is validated, the user is now logged in so the server sends the user their Session token to access protected resources.
            </p>
            <p>
                Some implementations will perform further verification checks such as seeing if the challenge is signed into the authenticatorData field and checking the origin to ensure there are no phishing attacks such as Cross-Site Scripting attacks.
            </p>
        </div>
        </>
    );
}