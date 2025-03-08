

export function History() {
    return (
        <>
        <h2>History of Authentication</h2>
        <h3><b>Passwords (1961-)</b></h3>

        <p>
            There were several predecessors to the modern digital password such as the Roman “watchword” which was a word you used to authenticate that you are a legitimate member of a unit in the Roman army. The watch commander would inscribe the watchword which changed per shift onto a tessera (a wooden block or tile) and then would pass the tessera down to the relevant units with each lower-level guard marking the tessera to indicate it had been successfully received. In order for a solider to pass through the city gates, the password would need to be recited correctly to the guards, otherwise access would be denied (Phang, 2007). 
        </p>

        <p>
            The first known digital password was created in 1961 as part of a time-sharing computer by MIT computer science professor Fernando Corbato. To login to the computer, the user would enter the command “login” and state their name and the project they wish to work on, this prompts the computer to return the current time and prompts the user to enter their password. The purpose of the password was to “protect the information and programs from accidental or malicious alteration by someone else (Experience has shown that some people are unable to resist the temptation to commit mischievous vandalism of that kind.)” and the printer is temporarily disconnected to prevent the password from being printed out (Fano, 1966).   
        </p>
        <img src="/static/assets/fernando-corbato.jpg" width="600" />
        <span>Figure 1: Fernando Corbato</span>
        <h3><b>Password Hashing (1973-)</b></h3>
        <p>
            The main fault identified in the first digital passwords in 1961 was the fact that the passwords were stored in plain text and as such anyone with a copy of the plaintext file would know the passwords of all users and as such could compromise any account. The very first hashing algorithm was developed in 1958 by Hans Peter Luhn for classifying and ordering data (Stevens, 2018), however the first application of hashing algorithms to passwords was in Unix in 1973 which enabled password hashing through the crypt utility program. The crypt utility was extremely insecure and could be easily cracked.
        </p>
        <p>
            Shortly thereafter salted hashes emerged as a way to mitigate against pre-computed hashes in rainbow tables. 
        </p>
        <img src="/static/assets/salt.png" width="600" />
        <span>Figure 2: Salting with Hashing - Source: GeeksForGeeks</span>
        <h3><b>Legacy OTP Tokens (1980-)</b></h3>
        <p>
            Due to the ease of which passwords could be compromised, in the 1980s OTPs (One Time Passwords) were invented. Each person would carry a small physical token producing a new code after approximately every 30 seconds that would enable them to login to the specific linked account in addition to their username and password.
        </p>
        <img src="/static/assets/rsa-token.jpg" width="600" />
        <span>Figure 3: A Legacy RSA SecurID Token</span>
        <h3><b>Public Key Infrastructure (1990-)</b></h3>
        <p>
            Public Key Infrastructure (PKI) technology was first developed by the US government in the 1970s but was kept secret for 20 years due to it being classified. With the advent of the World Wide Web in the 1990s, it became necessary to have a secure protocol for sending sensitive information over the Internet. This led to the creation of the TLS protocol which combined certificates with public/private key pairs enabling users to authenticate the website's IP with the domain and enabled packets sent to/from the server to be sent encrypted, mitigating against Man in the Middle attacks.
        </p>
        <h3><b>Single Sign On (2000-)</b></h3>
        <p>
            Single Sign On was developed as there were significant drawbacks to passwords, both for the user experience and security as users would need to login numerous times and in practice users would use the same or similar passwords across many different services. As such SSO would allow the user to simply use one third-party account (i.e. Work Account, Google Facebook) to sign in with a unique token given to the user by the third-party to automatically login to the specific service.
        </p>
        <p>
            Initially this was implemented in SAML, but recently the main protocol used is OAUTH2.
        </p>
        <img src="/static/assets/single-sign-on.png" width="600" />
        <h3><b>Multi Factor Authentication (2010-)</b></h3>
        <p>
            The major drawback to the legacy two-factor authentication that was used predominantly by banks was that physical security tokens needed to be sent to users. From approximately 2010, TOTPs started to become widespread as the TOTP standard in RFC6238 was published in 2008, which is essentially based upon the old Hop-based OTP but with each hop being a 30 second interval added to the current time/30 second intervals. Further, Google Authenticator was developed in 2010 which set the standard for communicating the secret keys used to clients in QR codes. Since then, TOTPs have become increadibly widespread due to the significant drawbacks of SMS code based Multi-Factor authentication which is vulnerable to attacks such as SIM swapping or simply looking at someone's notifications.    
        </p>
        <img src="/static/assets/modern-2fa.png" width="600" />
        <h3><b>Phone Biometrics (2014-)</b></h3>
        <p>
            From approximately 2014, some Android devices started having fingerprint scanners and facial recognition cameras (with IR dots to mitigate against holding up photos to the camera). Apple also followed this trend. Fingerprint scanners used to be on the front of devices on home buttons, but since many devices have fingerprint scanners on the back. Some devices abolished fingerprint scanners in favour of facial recognition as fingerprint scanners can be frustrating to use if they are not clean.
        </p>
        <p>
            These phone biometrics were used and still are used to login to apps whether third-party or pre-installed, particularly banking apps or critical system settings. They are also used for unlocking the phone on the lock screen.
        </p>
        <img src="/static/assets/fingerprint-unlock.jpg" width="600" />
        <h3><b>WebAuthn Authentication (FIDO2)</b></h3>
        <p>
            WebAuthn is a very recent standard that is a core component of the FIDO2 project which is a collaboration between the FIDO Alliance and World Wide Web Consortium (W3C) standards bodies to create strong authentication for the web. The WebAuthn protocol is a protocol that can be activated through JavaScript that enables the browser to utilise a variety of methods to authenticate through the user's Operating System such as fingerprints, facial recognition, device PIN and USB security keys. WebAuthn is an extension of the relatively recent Credential Management API developed by W3C  in 2016 that enables frontend JavaScript to add/retrieve credentials through calling navigator.credentials.create() or navigator.credentials.get() respectively.  
        </p>
        <p>
            These OS-based methods of authentication available through the WebAuthn protocol are known as "passkeys".
        </p>
        <p>
            Since 2018, Google Chrome has supported WebAuthn with most other major browsers offering compatibility that year. For mobile devices, WebAuthn compatibility has been even more recent with Google supporting WebAuthn passkeys from October 2022.
        </p>
        <img src="/static/assets/webauthn-chrome.png" width="600" />
        
        </>
    )
}