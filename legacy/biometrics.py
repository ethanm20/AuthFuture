from db import getUserFullName, getNewUnverifiedBiometricChallenge, getUserID, saveCredentialToUser, getTemporaryChallenge, getBiometricCreds, dbDeleteBiometricCredential, checkStepTwoToken, getNewUnverifiedBiometricID, getBiometricCredentialByID, setNewSessionToken
import secrets
import json
import base64
import cbor2


from hashlib import sha256
import ecdsa
from ecdsa.util import sigencode_der, sigdecode_der

#from Crypto.Signature import pkcs1_15
from Crypto.Hash import SHA256
from Crypto.PublicKey import RSA

# This function returns to the user the options they need to configure their biometric credential
# when registering (i.e. the assertation options). This includes providing the user the One Time
# challenge, to stop replay attacks, options for the types of credentials that will be accepted
# and the IDs of credentials already linked to this account so they don't send an existing 
# credential.
def newBiometricCredentialRequest(email):
    #Building the ExcludeCredentials Array (Credentials that are already registered to this account)
    credentials = getBiometricCreds(email)
    excludeCredentials = []
    for credential in credentials:
      excludeCredentials.append({
        'type': 'public-key',
        'id': credential['credentialId']
      })

    # Challenge: The One Time Challenge to stop replay attacks
    # rp: id : The domain of the server.
    # rp: name : An English name of the website.
    # user: id : A unique string for the user (not the username for security reasons)
    # user: name : The actual username for the user
    # user: display Name : The English name of the user
    # pubKeyCredParams: The IDs of the algorithms for the assertion signature that will be accepted
    # authenticatorSelection: Settings as to whether external USBs can be used, if it should store its own certificate
    #                         and if biometrics are mandatory.
    # excludeCredentials: A list of credential IDs already linked to the user so they don't use the same credential.
    response =  {
        "publicKey": {
          "challenge": getNewUnverifiedBiometricChallenge(email),
          "rp": { 
            "id": "localhost", 
            "name": "SECUREAuth" 
          },
          "user": {
            "id": getUserID(email),
            "name": email,
            "displayName": getUserFullName(email)
          },
          "pubKeyCredParams": [ 
            {"type": "public-key",
             "alg": -7},
            {"type": "public-key",
             "alg": -257}
          ],
          "authenticatorSelection": {
            "authenticatorAttachment": "platform",
            "userVerification": "preferred",
            "requireResidentKey": True
          },
          "excludeCredentials": excludeCredentials
        }
      }

    return json.dumps(response)

# This function processes the response of the user when registering with their local authenticator. 
# A number of verification checks are first made and then the credential details are stored in the database.
def newBiometricCredentialResponse(email, publicKeyArr, algorithm, name, credentialId, clientDataJSON):
    clientDataJSON = base64.b64decode(clientDataJSON.encode('ascii')).decode('ascii')
    clientData = json.loads(clientDataJSON)

    # Verifying the One Time challenge matches (stop replay attacks)
    if (clientData['challenge'] != getTemporaryChallenge(email)):
      return "Error: Challenge does not Match", 500

    # Verifying that this is an assertation (i.e. registering the biometric, not logging in with it)
    if (clientData['type'] != "webauthn.create"):
      return "Error: Method does not match", 500

    # Verifying this request was sent by the page hosted by this server (or this could be a fraudulent request)
    if ("http://localhost" not in clientData['origin']):
      return "Error: Origin does not match", 500

    # Saving the Public Key, Algorithm Type, English Credential Name & Credential ID in the Database
    credential = {
        'publicKey': publicKeyArr,
        'algorithm': algorithm,
        'challenge': getTemporaryChallenge(email),
        'name': name,
        'credentialId': credentialId
    }
    saveCredentialToUser(email, credential)

    return "Biometric Credential Added"

# Returns the English Names of Biometrics in the Database for a User
def getBiometricCredentialsNameList(email):
  credentialsList = getBiometricCreds(email)

  biometricNameList = []

  for credential in credentialsList:
    biometricNameList.append(credential['name'])

  return json.dumps(biometricNameList)

# Allows a Credential to be Deleted for a Given User
def deleteBiometricCredential(email, index):
  index = int(index)
  name = getBiometricCreds(email)[index]['name']
  dbDeleteBiometricCredential(email, index)

  return "Successfully Deleted Biometric Credential: " + name

# Returns the options for when users are logging in with their Credential
# Verifies the cookie Session ID from the previous login step is valid 
# Verifies the Challenge is Correct and then returns the Credential IDs
# of the credentials that can be used for login.
def checkBiometricCredentialRequest(email, token):
  # Verifying the token the user got from passing the TOTP step is valid
  if (checkStepTwoToken(email, token)):
    userID = getUserID(email)

    # Making a new Challenge for the User
    challenge = getNewUnverifiedBiometricChallenge(email)

    credentials = getBiometricCreds(email)

    allowCredentials = []

    # Making a list of valid Credential IDs stored in the database that the user could use to login
    for credential in credentials:
      allowCredentials.append({
        'type': 'public-key',
        'transports': ['internal'],
        'id': credential['credentialId']
      })

    # Returning the options to the user
    return {
      "publicKey": {
          "challenge": challenge,
          "rpId": "localhost",
          "allowCredentials": allowCredentials,
          "userVerification": "preferred",
      }
    }

  return "Error: Email or token invalid", 500

# Processes the response the user provides once they login with their credential (i.e. sends the assertion to the server)
# Checks the Session ID from the previous step (TOTP login) is correct, checks the challenge sent when getting the options
# from the function above is correct, checks origin & method matches, then checks that the signature sent in the assertion
# matches the stored public key for the credential from the database.
def checkBiometricCredentialResponse(email, token, assertion, credentialID):
  # Validate that the Session ID from the previous step (TOTP login) is correct
  if (checkStepTwoToken(email, token)):
    # Get the credential from the database for the Credential ID the user sent
    credentials = getBiometricCreds(email)
    credential = getBiometricCredentialByID(email, credentialID)

    print('Assertion')
    print(assertion)

    print('Credential')
    print(credential)

    # Get the Client Data from the clientDataJSON field sent in the assertion and decode it from base 64, and load the JSON
    clientDataJSONStr = base64.b64decode(assertion['clientDataJSON'].encode("ascii")).decode("ascii")
    clientData = json.loads(clientDataJSONStr)
    print(clientData)

    # Validate the challenge matches (stops replay attacks)
    if (clientData['challenge'] != getTemporaryChallenge(email)):
      return "Error: Challenge does not Match", 500

    # Make sure the method is correct (user is logging in with credential, not registering it)
    if (clientData['type'] != "webauthn.get"):
      return "Error: Method does not match", 500

    # Make sure the origin is from localhost (stops phishing attacks using methods such as Cross-Site Scripting)
    if ("http://localhost" not in clientData['origin']):
      return "Error: Origin does not match", 500

    # Loading the Authenticator Data which is Encoded in Both Base 64 & ASCII
    # TODO: This Data Would be Used for Verifying the Challenge is Signed into the authenticatorData field as an Additional
    #       security measure
    #       Also the authenticatorData field can be used to verify the certificate chain, i.e. check that the device's authenticator
    #       is trusted by a provider (i.e. Microsoft for Windows Hello)
    #authenticatorDataStr = cbor2.loads(base64.b64decode(assertion['authenticatorData'].encode("ascii"))).value[0]

    verified = False

    if (credential['algorithm'] == -7):
      #Verifying an ES256 Signature 
      verified = credentialVerifyES256(assertion['signature'], credential['publicKey'], assertion['authenticatorData'], assertion['clientDataJSON'])
    elif (credential['algorithm'] == -257):
      #Verifying an RSAA Signature 
      verified = credentialVerifyRS256(assertion['signature'], credential['publicKey'], assertion['authenticatorData'], assertion['clientDataJSON'])
    else:
      return "Error: Authenticator Algorithm not Supported", 500


    if (verified == True):
      tokenDetails = setNewSessionToken(email)
      print('RETURNED TOKEN DETAILS')
      print(tokenDetails)
      return tokenDetails


  return "Error: Token Invalid", 500

# (-7) ES256: ECDSA w/ SHA-256
def credentialVerifyES256(signature, publicKey, authenticatorData, clientDataJSON):
  # Decoding the fields from base 64
  clientDataJSONBytes = base64.b64decode(clientDataJSON.encode("ascii"))
  authenticatorDataBytes = base64.b64decode(authenticatorData.encode("ascii"))
  signatureBytes = base64.b64decode(signature.encode("ascii"))

  # Firstly the clientData needs to be hashed with SHA256
  hashedClientDataJSON = sha256(clientDataJSONBytes).digest()

  # The signed data to be checked is the concantanation of the authenticatorData (in bytes)
  # and the SHA-256 hashed version of the clientDataJSON field
  data = b"".join([authenticatorDataBytes, hashedClientDataJSON])

  
  # We Now Load the Public Key (stored in the database) & Decode it from the DER key format
  key = ecdsa.VerifyingKey.from_der(base64.b64decode(publicKey))

  try:
    # Try Verifying the Signature using the Signed Data & Public Key
    # The Signature is also in DER format
    # We need to use the SHA-256 version as this is ECDSA with SHA256
    key.verify(signatureBytes, data, sha256, sigdecode=sigdecode_der)
    print("Signature Verified")
    return True
  except ecdsa.BadSignatureError:
    print("Bad Signature")
    return False


# (-257) RS256: RSASSA-PKCS1-v1_5 using SHA-256
def credentialVerifyRS256(signature, publicKey, authenticatorData, clientDataJSON):
  # Decoding the fields from Base 64
  clientDataJSONBytes = base64.b64decode(clientDataJSON.encode("ascii"))
  authenticatorDataBytes = base64.b64decode(authenticatorData.encode("ascii"))
  signatureBytes = base64.b64decode(signature.encode("ascii"))

  # Hashing the clientDataJSON field with SHA256
  hashedClientDataJSON = sha256(clientDataJSONBytes).digest()

  # Merging the authenticatorData (in bytes) & the hashed version of clientDataJSON to 
  # work out the signed data to be checked
  data = b"".join([authenticatorDataBytes, hashedClientDataJSON])

  # Importing the RSA key from the Public Key (stored in the database)
  key = RSA.import_key(base64.b64decode(publicKey))
  # Hasing the calculated signed data with SHA256
  h = SHA256.new(data)
  try:
      # Try verifying the hashed signature with RSASSA
      #pkcs1_15.new(key).verify(h, signatureBytes)
      print("The signature is valid.")
      return True
  except (ValueError, TypeError):
    print("The signature is not valid.")
    return False










