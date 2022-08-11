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

router.post("/registerKeyBundle/:address/", async (req, res)  => {
    console.log("message body:")
    console.log(req.body);
    
    try {
	const address = await registerKeyBundle(req.params.address,
					       req.body);
	console.log("awaiting address");
	console.log(address);
	console.log("twas address");
    } catch (err) {
	console.log(err)
    }

    res.send(`Post request. data received:${req.body}`);
    return;
});

router.get("/getFullKeyBundle/:address/", async (req, res)  => {
    console.log("hope this works");
    try {
	const bundle = await getFullKeyBundle(req.params.address);
					     
	console.log("awaiting bundle");
	console.log(bundle);
	console.log("twas bundle");
	res.send(JSON.stringify(bundle))

    } catch (err) {
	console.log(err)
    }
    
    return "failed";

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

