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
    getFullKeyBundle,
    getFullKeyBundleByID,
    replaceSignedPreKey,
    replaceOneTimePreKeys,
    removeAddress,
    getPublicPreKeyBundle
} from './key-table.ts';
import { Server } from "socket.io";


import {
    MessageTableItem,
    storeMessage,
    getMessagesAfter,
    getMessagesBefore,
    deleteMessagesBefore
} from './message-table';

import MongoClient from 'mongodb';

import {connectToDatabase} from "./database-service.ts";

import http from 'http';
import https from 'https';
import express from 'express';
import cors from 'cors';
const uuidv4 = require('uuid').v4;

import { Server } from "socket.io";


const app = express();

const server = http.createServer(app);

const io = new Server(server,{
    cors: {
	origin: '*',
	methods: ['GET', 'POST']
    }});

const userConnections = new Map();

class Connection {
    constructor(io, socket) {
	this.socket = socket;
	this.io = io;

	socket.on('getMessages', () => this.getMessages());
	socket.on('message', (value) => this.handleMessage(value));
	socket.on('disconnect', () => this.disconnect());
	socket.on('connect_error', (err) => {
	    console.log(`connect_error due to ${err.message}`);
	});
    }
    
    sendMessage(message) {
	this.io.sockets.emit('message', message);
    }
    
    getMessages() {
	// const messages = await getMessagesAfter(req.params.address, req.params.timestamp);
	// messages.forEach((message) => this.sendMessage(message));
	this.io.sockets.emit('message', "this is a test");
	
    }

    handleMessage(value) {
	const message = {
	    id: uuidv4(),
	    user: this.socket,
	    value,
	    time: Date.now()
	};
	console.log(this.socket);

	this.sendMessage(message);

    }

    disconnect() {
	//users.delete(this.socket);
    }
}

// function chat(io) {
    
// };

//module.exports = chat;


const router = express.Router();

router.use(express.json());

io.on('connection', (socket) => {
    console.log("CONNECTING");
    console.log(io);
    console.log(socket);
    new Connection(io, socket);   
});

// io.on('connection', (socket) => {
//     console.log('a user connected');
//   });
  
server.listen(2999, () => {
    console.log('listening on *:2999');
});

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
	const bundles = await getFullKeyBundle(req.params.address);
	console.log("FullKeyBundle for ", req.params.address);
	console.log(bundles);
	res.send(JSON.stringify(bundles));
    } catch (err) {
	console.log(err)
	res.send("${err}");
    }
});


// Expects an address in the request url, returns the KeyTableItem(FullKeyBundle extension) for a user
router.get("/getFullKeyBundleByID/:address/", async (req, res)  => {
    try {
	const bundles = await getFullKeyBundleByID(req.params.address);
	console.log("FullKeyBundle for ", req.params.address);
	console.log(bundles);
	res.send(JSON.stringify(bundles));
    } catch (err) {
	console.log(err)
	res.send("${err}");
    }
});

/* Key Table Endpoints*/
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
	console.log("Address removed:", req.params.address);
	console.log(status);
    } catch (err) {
	console.log(err)
    }
    return;
});

// Expects an address in the request url, pops and returns public prekey (PublicPreKeyBundle) from server
router.get("/getPublicPreKeyBundle/:address/", async (req, res) => {
    try {
	const bundle = await getPublicPreKeyBundle(req.params.address);
	console.log("PublicPreKeyBundle for :", req.params.address);
	console.log(bundle);
	res.send(bundle);
    } catch (err) {
	console.log(err)
	res.send("${err}");
    }
    return;
});

/* Message Table Endpoints*/

// Expects an address in the request url, stores a message in the database and returns it as MessageTableItem
router.post("/storeMessage/:address/", async (req, res) => {
    console.log("MESSAGE BODY:")
    console.log(req.body);
    try {
	const message = await storeMessage(req.params.address, req.body);
	console.log("Message Added to Address:", req.params.address);
	res.send(JSON.stringify(message));
    console.log("emmitting")
    io.emit('message', req.body);
    } catch (err) {
	console.log(err)
	res.send("${err}");
    }
    return;    
});

// Expects and address and timestamp (seconds), returns the messages since then as a MessageTableItem[]
router.get("/getMessagesAfter/:address/:timestamp/", async (req, res) => {
    console.log("GETTING MESSAGES FOR", req.params.address, "AFTER", req.params.timestamp);
    try{
	const messages = await getMessagesAfter(req.params.address, req.params.timestamp);
	console.log(messages);
	res.send(JSON.stringify(messages));
    } catch (err) {
	console.log(err)
	res.send("${err}");
    }
});

// Expects and address and timestamp (seconds), returns the messages before then as a MessageTableItem[]
router.get("/getMessagesBefore/:address/:timestamp/", async (req, res) => {
    console.log("GETTING MESSAGES FOR", req.params.address, "BEFORE", req.params.timestamp);
    try{
	const messages = await getMessagesAfter(req.params.address, req.params.timestamp);
	console.log(messages);
	res.send(JSON.stringify(messages));
    } catch (err) {
	console.log(err)
	res.send("${err}");
    }
});

// Expects and address and timestamp (seconds), removes the messages for user before date
router.post("/deleteMessagesBefore/:address/:timestamp/", async (req, res) => {
    console.log("REMOVING MESSAGES FOR", req.params.address, "BEFORE", req.params.timestamp);
    try{
	const messages = await getMessagesAfter(req.params.address, req.params.timestamp);
	console.log(messages);
    } catch (err) {
	console.log(err)
	res.send("${err}");
    }
});

// const routerTest = async () => {
//     console.log("STARTING ROUTING TESTS");

//     const response = await fetch('localhost:443/getFullKeyBundle/911-911-1912')
//     const json = await response.json()
//     console.log(json);
// }

// Connect to database then start server
connectToDatabase().then(() => {
    app.use('/', router);
    app.listen(443, () => {
	console.log(`Server started at http://localhost:${443}`);
    });
    console.log("t");
    // chat(io);
    //routerTest();

});
