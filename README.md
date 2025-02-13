# COMP6441 Something Awesome Project

COMP6441 Something Awesome project by Ethan Marlow (z5312704) in tutorial group W09B.

## Description

Web Authentication methods including WebAuthn, hashed passwords, tokens and TOTPs. Includes both the demo Web App and the accompanying static pages.

## Getting Started

### Technical Details

The project backend requires a Python 3 interpreter, the frontend is designed to work in modern browsers and is tested with Google Chrome.

Options for WebAuthn may be limited based upon OS settings and the signature algorithms used. The web app only supports WebAuthn credentials signed with
the two default major algorithms: ECDSA with SHA256 or RSASSA-PKCS1-v1_5 

The demo web app for simplicity will only accept internal WebAuthn authenticators, not roaming authenticators (i.e. USB security keys or NFC/Bluetooth tokens).

### Third-Party Dependencies

* Flask
* CBOR2
* ECDSA
* PyCrypto

### Installing Dependencies

* If any of the above third-party Python3 dependencies are not installed, execute the respective command/s below:

```
pip3 install flask
```

```
pip3 install cbor2
```

```
pip3 install cbor2
```

```
pip3 install ecdsa
```

```
pip3 install pycrypto
```

### Executing program

* Navigate to the root of the repository folder which contains the critical app.py file.
* In this folder execute:

```
flask run
```

* Then whilst keeping the terminal running, navigate to localhost:5000 in a web browser