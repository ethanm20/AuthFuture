from flask import Flask, render_template, request, redirect

from db import addUserToDB, getUsersFromDB, dbGetUserSessionDetails, getUserFullName
from biometrics import newBiometricCredentialRequest, newBiometricCredentialResponse, getBiometricCredentialsNameList, deleteBiometricCredential, checkBiometricCredentialRequest, checkBiometricCredentialResponse

from register import configureOTP

from login import loginStepOne, loginStepTwo

import json
import base64
from datetime import datetime

app = Flask(__name__)

# Static Page: Homepage
@app.route('/', methods=['GET'])
def route_index():
    return redirect('/history-authentication', code=302)

# Static Page: Login
@app.route('/login', methods=['GET'])
def route_login_get():
    return render_template('login.html')

# Login Step 1
# POST Route: Frontend Sends Username & Password to Server for Step 1 of Login
@app.route('/login', methods=['POST'])
def route_login_post():
    data = request.json
    result = loginStepOne(data.get('email'), data.get('password'))
    return result

# Login Step 2
# POST Route: Frontend Sends TOTP to Server in Step 2 of Login for Verification
@app.route('/login-totp', methods=['POST'])
def route_login_totp_post():
    data = request.json
    result = loginStepTwo(data.get('email'), data.get('token'), data.get('totp'))
    return result

# Checking the Biometric Request
# POST Route: For when User Gets Options from Server to Get the Credential on Login
@app.route('/auth/checkBiometricRequest', methods=['POST'])
def route_check_biometric_request():
    data = request.json
    result = checkBiometricCredentialRequest(data.get('email'), data.get('token'))
    return result

# Checking the Biometric Response
# POST Route: For when User Sends the Signature Based on their Stored Credential to the Server for Verification
@app.route('/auth/checkBiometricResponse', methods=['POST'])
def route_check_biometric_response():
    data = request.json
    result = checkBiometricCredentialResponse(data.get('email'), data.get('stepTwoToken'), data.get('assertion'), data.get('credentialId'))
    return json.dumps(result)

# Static Page: The Registration HTML Page
@app.route('/register', methods=['GET'])
def route_register_get():
    return render_template('register.html')

# Step 1: Registration
# POST Method: User Registers their First Name, Last Name, Email and Password
@app.route('/register', methods=['POST'])
def route_register_post():
    data = request.json
    addUserToDB(data.get('firstName'), data.get('lastName'), data.get('email'), data.get('password'))
    tokenDetails = dbGetUserSessionDetails(data.get('email'))
    return json.dumps(tokenDetails)

# Step 2: Registration
# POST Method: User Receives their TOTP Secret to Make the QR Code
@app.route('/register-steptwo', methods=['POST'])
def route_register_steptwo_get():
    print('registerStepTwo')
    data = request.json
    print('email')
    print(data.get('email'))
    return configureOTP(data.get('email'))

# Step 3: Registration
# POST Method: User Requests the Options from the Server for Making a New WebAuthn Credential
@app.route('/auth/registerRequest', methods=['POST'])
def route_register_biometrics():
    data = request.json

    return newBiometricCredentialRequest(data.get('email'))

# Step 3: Registration
# POST Method: User Returns the Public Key & Other Details of the WebAuthn Credential they Have Made to Server
@app.route('/auth/registerResponse', methods=['POST'])
def route_register_response_biometrics():
    data = request.json
    print("Response worked")
    print(data)
    print(json.dumps(data))
    return newBiometricCredentialResponse(data.get('email'), data.get('publicKey'), data.get('alg'), data.get('name'), data.get('credentialId'), data.get('clientDataJSON'))

# Step 3: Registration
# POST Method: Returns the Credentials User has Stored on their Account
@app.route('/auth/getBiometricCredentials', methods=['POST'])
def route_get_biometric_credentials():
    data = request.json
    return getBiometricCredentialsNameList(data.get('email'))

# Step 3: Registration
# POST Method: Deleting an Existing Biometric Credential
@app.route('/auth/deleteBiometricCredential', methods=['POST'])
def route_delete_biometric_credential():
    data = request.json
    return deleteBiometricCredential(data.get('email'), data.get('index'))

#@app.route('/auth/finaliseRegistration', methods=['POST'])
#def route_finalise_registration():
#    data = request.json
#    return

# Static Page: Dashboard
# Renders the Dashboard Page, Needs the Login Token to Return the Core User Details
@app.route('/dashboard', methods=['GET'])
def route_dashboard_get():
    print("Cookies List")
    print(request.cookies)
    token = request.cookies.get('secureAuthToken')
    email = request.cookies.get('secureAuthEmail')

    if (token is None):
        return "Error: Not logged in, please <a href='/login'>login</a>", 500

    sessionDetails = dbGetUserSessionDetails(email)

    if (sessionDetails is None):
        return "Error: Not logged in, please <a href='/login'>login</a>", 500

    timeToExpiry = datetime.fromisoformat(sessionDetails['expTime']) - datetime.now()

    print('Token')
    print(token)
    print(timeToExpiry)
    print(sessionDetails)

    if ((token != sessionDetails['token']) or (timeToExpiry.total_seconds() <= 0)):
        return "Error: Invalid Token, please <a href='/login'>login</a>", 500



    
    name = getUserFullName(email)

    return render_template('dashboard.html', email=email, name=name, token=token)

# Static Page: History of Authentication
@app.route('/history-authentication', methods=['GET'])
def route_history_auth_get():
    return render_template('history-authentication.html')

# Static Page: WebAuthn Description
@app.route('/webauthn-authentication', methods=['GET'])
def route_webauthn_auth_page_get():
    return render_template('webauthn-page.html')

# Static Page: Passwords Description
@app.route('/passwords-authentication', methods=['GET'])
def route_passwords_auth_page_get():
    return render_template('passwords-authentication.html')

# Static Page: Tokens Description
@app.route('/token-authentication', methods=['GET'])
def route_tokens_auth_page_get():
    return render_template('token-authentication.html')

# Static Page: TOTP Description
@app.route('/totp-authentication', methods=['GET'])
def route_totp_auth_page_get():
    return render_template('totp-authentication.html')


# Static Page: Security Vulnerabilities
@app.route('/security-vulnerabilities', methods=['GET'])
def route_security_vulnerabilities_page_get():
    return render_template('security-vulnerabilities.html')

