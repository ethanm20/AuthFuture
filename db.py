import json
import copy

from otp import generate_secret_key



import bcrypt
import secrets

from datetime import datetime
from datetime import timedelta

import calendar

# Adds a User to the Database
def addUserToDB(firstName, lastName, email, password):
    # Reading all userdata from DB
    db_data = getUsersFromDB()
    
    # Making a new Salt for the Password Hash (Mitigates against Rainbow Table Attacks)
    # Uses bcrypt hash algorithm
    hashSalt = bcrypt.gensalt() 

    # We store the following
    # id: Random Unique String that will be used later on for WebAuthn 
    # firstName
    # lastName
    # email
    # password: This is hashed using the hash salt with bcrypt algorithm
    # hashSalt: We need to store the hash salt otherwise, we can't verify password is correct
    # otpSecretKey: The shared secret key for TOTP which is sent to the user in the QR code, we need this to verify TOTP codes entered on login
    # biometricCredentials: This is where any WebAuthn Credentials will be stored
    # unverifiedBiometricChallenge: We need to store the challenge after user requests new options from the server for webAuthn
    # sessionToken: This is the Session ID/token for when user logs in, it also stores the expiry for when the token expires
    # tempLoginTokens: The login process is multifactor username/password, TOTP and WebAuthn, we need to store a new token at each phase 
    #                  the user passes when logging in.
    userData = {
        'id': generate_user_id(),
        'firstName': firstName,
        'lastName': lastName,
        'email': email,
        'password': bcrypt.hashpw(password.encode('UTF-8'), hashSalt).decode('UTF-8'),
        'hashSalt': hashSalt.decode('UTF-8'),
        'otpSecretKey': generate_secret_key(),
        'biometricCredentials': [],
        'unverifiedBiometricChallenge': '',
        'unverifiedBiometricId': '',
        'sessionToken': {
            'token': generate_session_token(),
            'expTime': calculate_session_token_expiry()
        },
        'tempLoginTokens': {
            'stepOne': {
                'token' : '',
                'expTime': ''
            },
            'twoFactorTOTP': {
                'token': '',
                'expTime': ''
            }
        }
    }
    
    # Adding the user data to the existing users from database
    if (db_data == None):
        db_data = [userData]
    else:
        db_data.append(userData)

    
    # Writing the new data to the database (database.json)
    with open('database.json', 'w') as dbFile:
        db_data_string = json.dumps(db_data, indent=4)
        dbFile.write(db_data_string)
        dbFile.close()

# Getting all User Data from the Database
def getUsersFromDB():
    db_data = {}
    with open('database.json', 'r') as dbFile:
        db_data = copy.deepcopy(json.loads(dbFile.read()))
        dbFile.close
    
    
    return db_data

# Getting the TOTP secret key for a user
def getUserSecretKey(email):
    users = getUsersFromDB()

    for user in users:
        if (email == user['email']):
            return user['otpSecretKey']

    return None

# Getting the Full Name for a User
def getUserFullName(email):
    users = getUsersFromDB()

    for user in users:
        if (email == user['email']):
            return user['firstName'] + ' ' + user['lastName']

    return None

# Getting the User ID (for WebAuthn purposes) for a user
def getUserID(email):
    users = getUsersFromDB()

    for user in users:
        if (email == user['email']):
            return user['id']

    return None

# Making a new Challenge & Getting it (for WebAuthn purposes) for a user
def getNewUnverifiedBiometricChallenge(email):
    users = getUsersFromDB()
    biometricChallenge = ''
    for user in users:
        if (email == user['email']):
            user['unverifiedBiometricChallenge'] = generate_unverified_biometric_challenge()
            biometricChallenge = user['unverifiedBiometricChallenge']

    with open('database.json', 'w') as dbFile:
        db_data_string = json.dumps(users, indent=4)
        dbFile.write(db_data_string)
        dbFile.close()

    print('Biometric Challenge')
    print(biometricChallenge)
    return biometricChallenge

# Getting the Temporary Certificate ID for a user
def getNewUnverifiedBiometricID(email):
    users = getUsersFromDB()
    biometricID = ''
    for user in users:
        if (email == user['email']):
            user['unverifiedBiometricId'] = secrets.token_hex(16)
            biometricID = user['unverifiedBiometricId']

    with open('database.json', 'w') as dbFile:
        db_data_string = json.dumps(users, indent=4)
        dbFile.write(db_data_string)
        dbFile.close()

    print('Biometric ID')
    print(biometricID)
    return biometricID

# Making a Session Token
def generate_session_token():
    return secrets.token_hex(16)

# Getting the Session Expiry Time (2 hours from now, in ISO format)
def calculate_session_token_expiry():
    expTime = datetime.now() + timedelta(hours=2)
    #return calendar.timegm(expTime)
    return expTime.replace(microsecond=0).isoformat()
    #return str(expTime) 

# Making a new User ID (for WebAuthn purposes)
def generate_user_id():
    return secrets.token_hex(16)

# Making a new Challenge (for WebAuthn Purposes)
def generate_unverified_biometric_challenge():
    return secrets.token_hex(16)

# Writing a Credential to the Database
def saveCredentialToUser(email, credential):
    users = getUsersFromDB()
    
    for user in users:
        if (email == user['email']):
            user['biometricCredentials'].append(credential)

    with open('database.json', 'w') as dbFile:
        db_data_string = json.dumps(users, indent=4)
        dbFile.write(db_data_string)
        dbFile.close()

    return 

# Getting the Challenge (for WebAuthn) for a User
def getTemporaryChallenge(email):
    users = getUsersFromDB()
    
    for user in users:
        if (email == user['email']):
            
            return user['unverifiedBiometricChallenge']
    
    return

# Getting the Stored Credentials for a User (for WebAuthn purposes)
def getBiometricCreds(email):
    users = getUsersFromDB()
    
    for user in users:
        if (email == user['email']):
            
            return user['biometricCredentials']
    
    return

# Deleting a Stored WebAuthn Credential for a User
def dbDeleteBiometricCredential(email, index):
    users = getUsersFromDB()
    
    for user in users:
        if (email == user['email']):
            
            user['biometricCredentials'].pop(index)

    with open('database.json', 'w') as dbFile:
        db_data_string = json.dumps(users, indent=4)
        dbFile.write(db_data_string)
        dbFile.close()
    
    return

# Getting the Session Token & its Expiry for a User
def dbGetUserSessionDetails(email):
    users = getUsersFromDB()
    
    for user in users:
        if (email == user['email']):
            
            return user['sessionToken']

    return

# Configuring a New Step 1 Token for Login
def setStepOneToken(email, token, expiry):
    users = getUsersFromDB()
    
    for user in users:
        if (email == user['email']):
            user['tempLoginTokens']['stepOne']['token'] = token
            user['tempLoginTokens']['stepOne']['expTime'] = expiry

    with open('database.json', 'w') as dbFile:
        db_data_string = json.dumps(users, indent=4)
        dbFile.write(db_data_string)
        dbFile.close()

    return

# Configuring a New Step 2 Login Token
def setStepTwoToken(email, token, expiry):
    users = getUsersFromDB()
    
    for user in users:
        if (email == user['email']):
            user['tempLoginTokens']['twoFactorTOTP']['token'] = token
            user['tempLoginTokens']['twoFactorTOTP']['expTime'] = expiry

    with open('database.json', 'w') as dbFile:
        db_data_string = json.dumps(users, indent=4)
        dbFile.write(db_data_string)
        dbFile.close()

    return

# Configuring a New Session Token (for When User has Finished Logging In or Registering)
def setNewSessionToken(email):
    users = getUsersFromDB()

    token = ''
    expTime = ''
    
    for user in users:
        if (email == user['email']):
            user['sessionToken']['token'] = generate_session_token()
            user['sessionToken']['expTime'] = calculate_session_token_expiry()
            token = user['sessionToken']['token'],
            expTime =  user['sessionToken']['expTime']
            

    with open('database.json', 'w') as dbFile:
        db_data_string = json.dumps(users, indent=4)
        dbFile.write(db_data_string)
        dbFile.close()

    return {
        "token": token,
        "expTime": expTime
    }

# Checking the Step 2 Login Token
def checkStepTwoToken(email, token):
    users = getUsersFromDB()

    if (users == None):
        return "There are no users in the database"
    
    for user in users:
        if ((email == user['email']) and (user['tempLoginTokens']['twoFactorTOTP']['token'] == token)):
            timeToExpiry = datetime.fromisoformat(user['tempLoginTokens']['twoFactorTOTP']['expTime']) - datetime.now() 

            if (timeToExpiry.total_seconds() > 0):
                return True

    return False

# Getting a Specific WebAuthn Credential from a User Using the Credential ID
def getBiometricCredentialByID(email, credentialID):
    credentials = getBiometricCreds(email)

    for credential in credentials:
        if (credential['credentialId'] == credentialID):
            return credential

    return None