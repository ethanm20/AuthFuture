from db import getUsersFromDB, getUserSecretKey
from otp import generate_valid_TOTPs

import json

# Get the secret Key for a User (used at the Registration Stage so User Frontend can Make QR Code)
def configureOTP(email):
    otpData = {
        'secretKey', getUserSecretKey(email)
    }
    print('otpData')
    print(otpData)
    
    return json.dumps(generate_valid_TOTPs(getUserSecretKey(email)))

    
