import base64
import hashlib
import hmac
import struct
import time

import secrets

#Calculating the Valid TOTPs for the Current Time +/- 90seconds
def generate_valid_TOTPs(secret):
    # Decoding the Base32 Secret Key into Bytes
    print('secret')
    print(secret)
    key = base64.b32decode(secret)

    # Time Divided by 30 Second Intervals
    UNIXTimeHops = int(time.time() / 30)

    TOTPs = []

    # This For Loop is to Determine valid TOTPs +/- 90 Seconds
    for currHopCount in range(-3, 3):
        # We Convert the Result of totalTimeIntervals + currInterval into Bytes, encoded as a Long Long Integer (i.e. 8 bytes/ 64 bits)
        hopCountBytes = struct.pack(">q", UNIXTimeHops + currHopCount)

        print('HOP')
        print(UNIXTimeHops + currHopCount)

        # Getting the HMAC-SHA1 hash of Secret Key & Interval (as Bytes)
        hash = hmac.HMAC(key, hopCountBytes, hashlib.sha1).digest()
        print('HMAC')
        print(base64.b64encode(hash).decode('utf-8'))

        #Truncating the Hash

        # We Find the Offset by Taking the Rightmost Byte of the Hash and
        # then performing a Bitwise AND operation with 0F (corresponds to 1111 in binary)
        # This effectively means that the offset is the last 4 bits of the hash
        offset = hash[-1] & 0x0F

        print('Last Byte')
        print(hash[-1])

        print('Offset')
        print(offset)

        # The truncated hash is is then the bytes from the offset index to the (offset index + 4), i.e. truncated hash is 4 bytes (or 32 bits)
        truncatedHash = hash[offset:offset + 4]
        print('Truncated Hash')
        print(truncatedHash)

        # Converting the Truncated Hash as Bytes to Bits (returns a single 4 byte/32 bit number in bits)
        code = struct.unpack(">L", truncatedHash)[0]
        # We Now do a Bitwise AND operation 7FFFFFF corresponds to (1111111111111111111111111111111) a 32 bit signed number in binary to excise any extra bits
        code &= 0x7FFFFFFF

        print('Long Code')
        print(code)

        # Gets Last 6 Digits of result (by using the mod function)
        code %= 10 ** 6

        # We Now Need to Pad this Code With 0s at the start
        # if there are Less than 6 digits (as Python automatically removes Leading Zeros in Maths)
        code = str(code).zfill(6)

        print('Code')
        print(code)


        TOTPs.append({
            'TOTPcode': code,
            'secretKey': secret,
            'HMACHash': struct.unpack_from(">L", hash)[0],
            'truncatedHash': struct.unpack(">L", truncatedHash)[0],
            'hopCount':  UNIXTimeHops + currHopCount
        })
    
    print(TOTPs)
    return TOTPs

while True:
    secret = "NVKUYRTKKZBDATSIPBAVUZ2GHAYDK2KHNVWWQSRTMVXVQWLROZGQ===="
    generate_valid_TOTPs(secret)
    time.sleep(30)  # Wait for 10 seconds