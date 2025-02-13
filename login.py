import secrets
import bcrypt
from datetime import datetime
from datetime import timedelta

from db import addUserToDB, getUsersFromDB, setStepOneToken, setStepTwoToken
from otp import check_totp_valid

# Step 1: Processing when a user logs in with username and password
def loginStepOne(email, password):
    users = getUsersFromDB()

    if (users == None):
        return "There are no users in the database"
    
    for user in users:
        if (email == user['email']):
            enteredPasswordHash = bcrypt.hashpw(password.encode('UTF-8'), user['hashSalt'].encode('UTF-8')).decode('UTF-8')
            # Checking Password Hash is Correct (by hashing the entered password with the stored salt) & seeing if it matches stored Password Hash
            if (enteredPasswordHash == user['password']):
                stepOneToken = secrets.token_hex(16)
                stepOneTokenExpiry = (datetime.now() + timedelta(hours=0.5)).replace(microsecond=0).isoformat()
                # Setting the Token for Completing Step 1 of the Login Process
                setStepOneToken(email, stepOneToken, stepOneTokenExpiry)

                # Returning Step 1 Token to User so They Can Start on Step 2 (TOTP Verification)
                return {
                    'token': stepOneToken,
                    'expTime': stepOneTokenExpiry
                }

    return "Error: Username or password is incorrect", 500

# Step 2: Processing when a user logs in with TOTP
def loginStepTwo(email, token, totp):
    users = getUsersFromDB()

    if (users == None):
        return "There are no users in the database"
    
    for user in users:
        # Make Sure the Token from Step 1 Matches
        if ((email == user['email']) and (user['tempLoginTokens']['stepOne']['token'] == token)):
            timeToExpiry = datetime.fromisoformat(user['tempLoginTokens']['stepOne']['expTime']) - datetime.now() 

            # Make Sure Token has Not Expired & Check the TOTP Entered is Valid
            if ((timeToExpiry.total_seconds() > 0) and check_totp_valid(user['otpSecretKey'], totp)):
                stepTwoToken = secrets.token_hex(16)
                stepTwoTokenExpiry = (datetime.now() + timedelta(hours=0.5)).replace(microsecond=0).isoformat()

                # Make and Save the New Step 2 Token so User can Complete Step 3 (WebAuthn verification)
                setStepTwoToken(email, stepTwoToken, stepTwoTokenExpiry)

                # Return Step 2 Token to User
                return {
                    'token': stepTwoToken,
                    'expTime': stepTwoTokenExpiry
                }

    return "Error: Username or password is incorrect", 500

    