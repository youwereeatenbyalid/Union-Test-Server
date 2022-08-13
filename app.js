/* eslint-disable @typescript-eslint/no-explicit-any */
// import {  StorageType, Direction, SessionRecordType, SignalProtocolAddress, PreKeyPairType, SignedPreKeyPairType } from '@privacyresearch/libsignal-protocol-typescript'

// import signalPKG from '@privacyresearch/libsignal-protocol-typescript';
// const {  StorageType, Direction, SessionRecordType, SignalProtocolAddress, PreKeyPairType, SignedPreKeyPairType } = signalPKG;
import {
    KeyHelper,
    SignedPublicPreKeyType,
    SignalProtocolAddress,
    SessionBuilder,
    PreKeyType,
    SessionCipher,
    MessageType }
from '@privacyresearch/libsignal-protocol-typescript'

import { SignalProtocolStore } from './storage-type.ts';

import {
    FullKeyBundle,
    registerKeyBundle,
    getFullKeyBundle
} from './key-table.ts';

import MongoClient from 'mongodb';

import {connectToDatabase} from "./database-service.ts";

import http from 'http';
import https from 'https';
import express from 'express';
const hostname = '167.99.43.209';
//const hostname = '192.168.1.4';

const app = express();

const router = express.Router();

router.use(express.json());


// address is currently phone number

// Expects an address in the request url and jsonified FullKeyBundle in the body.
// Returns address on success, null otherwise
router.post("/registerKeyBundle/:address/", async (req, res)  => {
    console.log("MESSAGE BODY (Expecting FullKeyBundle):")
    console.log(req.body);
    try {
	const address = await registerKeyBundle(req.params.address, req.body);
	console.log("Address Added:", address);
	res.send(address);
    } catch (err) {
	console.log(err)
	res.send("${err}");
    }
    return;
});

// Expects an address in the request url, returns the KeyTableItem(FullKeyBundle extension) for a user
router.get("/getFullKeyBundle/:address/", async (req, res)  => {
    try {
	const bundle = await getFullKeyBundle(req.params.address);
	console.log("FullKeyBundle for ", address);
	console.log(bundle);
	res.send(JSON.stringify(bundle));
    } catch (err) {
	console.log(err)
	res.send("${err}");
    }
});

// Expects an address in the request url, jsonified SignedPublicKey in the body
router.post("/replaceSignedPreKey/:address/", async (req, res) => {
    console.log("MESSAGE BODY (Expecting SignedPublicKey):")
    console.log(req.body);
    try {
	const status = await replaceSignedPreKey(req.params.address,
						 req.body);
	console.log(status);
    } catch (err) {
	console.log(err)
    }
    return;
});

// Expects an address in the request url, jsonified PublicPreKey[] in the body
router.post("/replaceOneTimePreKeys/:address/", async (req, res) => {
    console.log("MESSAGE BODY (Expecting PublicPreKey[]):")
    console.log(req.body);
    try {
	const status = await replaceOneTimePreKeys(req.params.address,
						   req.body);
	console.log(status);
    } catch (err) {
	console.log(err)
    }
    return;
});

// Expects an address in the request url, removes address from server
router.post("/removeAddress/:address/", async (req, res) => {
    try {
	const status = await removeAddress(req.params.address,
					   req.body);
	console.log("Address removed:", address);
	console.log(status);
    } catch (err) {
	console.log(err)
    }
    return;
});

// Expects an address in the request url, pops and returns public prekey (PublicPreKeyBundle) from server
router.post("/getPublicPreKeyBundle/:address/", async (req, res) => {
    try {
	const bundle = await getPublicPreKeyBundle(req.params.address);
	console.log("PublicPreKeyBundle for :", address);
	console.log(bundle);
	res.send(bundle);
    } catch (err) {
	console.log(err)
	res.send("${err}");
    }
    return;
});


connectToDatabase().then(() => {
    app.use('/', router);
    app.listen(443, () => {
	console.log(`Server started at http://localhost:${443}`);
    });

});



// app.post("/getFullKeyBundle/:address", async (req, res) => {
//     console.log
// });

// // file location of private key
// var privateKey = fs.readFileSync( 'private.key' );

// // file location of SSL cert
// var certificate = fs.readFileSync( 'ssl.crt' );

// set up a config object
var server_config = {
    // key : privateKey,
    // cert: certificate
};

// create the HTTP server on port 443
// var http_server = http.createServer(server_config, app).listen(443, function(){
//     console.log("Node.js Express HTTP Server Listening on Port 443");
// });

// // create an HTTP server on port 80 and redirect to HTTPS
// var http_server = http.createServer(function(req,res){    
//     // 301 redirect (reclassifies google listings)
//     res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
//     res.end();
// }).listen(80, function(err){
//     console.log("Node.js Express HTTPS Server Listening on Port 80");    
// });

