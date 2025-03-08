export function Tokens() {
    return (
        <>
        <h2>Token Authentication</h2>
        
        <div>
            <h3>What is token authentication?</h3>
            <p>
                Token authentication allows a user to access a protected resource by sending a token (a code) within the web request that it was sent by the server during login.
            </p>
            <p>
                There are two main methods of token authentication: 
            </p>
            <ul>
                <li><b>Bearer Authentication:</b> The user's browser manually sends the token in the header of HTTP requests through JS in the "Authorization" field which the server verifies before sending the response. If the browser window is closed the token is automatically deleted as it is saved in the Session Storage, not Cookie Storage.</li>
                <li><b>Cookie Authentication:</b> The user's browser automatically sends the token along with all other cookies in the HTTP request in the "Cookies" field of the HTTP header.</li>
            </ul>
            <p>
                Types of tokens:
            </p>
            <ul>
                <li><b>Opaque Tokens:</b> Opaque Tokens are just a unique identifier that can be verified by checking if it is in the database and has not expired. </li>
                <li><b>JSON Web Tokens: </b> JSON Web Tokens are different to Opaque Tokens as they do not need to be checked against a database to be verified. The token is not just a unique identifier but is a JSON string.</li>
            </ul>
        </div>
        <div>
            <h3>JSON Web Tokens</h3>
            <p>JSON Web Tokens are more efficient than Opaque Tokens as databases do not have to be checked to see if the token is valid or not.</p>
            <p><b>Step 1 (User Logs In):</b> The user logs in and receives a secret token from the server, the secret token is not exactly the same for all users but is signed from one private key the server holds and encrypted with the time and user ID.   </p>
            <p><b>Step 2 (User Accesses Protected Resource): </b></p> The user when making the HTTP request to the server sends a JSON Web Token to the server as a base64 string in the "Authorisation" field.
            <p>The JSON Web Token is represented as follows and sent as a base64 string: </p>
            <code>
                /*
                    header: 
                            alg: "HS256",
                            typ: "JWT"
                    ,
                    payload: 
                            sub: 123456
                            exp: "1 Jan 2024"
                            name: "John Smith"
                            admin: True
                    ,
                    signature: 
                        HMACSHA256(header, payload, secret)
                    
                */
            </code>
            <p><b>Step 3 (Server Verification): </b> The server verifies the JWT is valid, using its private key and the header and payload content to verify the signature. If so, the JWT is valid and the header and payload content can be trusted as true, so there is no need for a database request. The server returns to the user the protected resource.</p>
        </div>
        </>
    )
}
