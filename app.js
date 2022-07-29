const webSocketsServerPort = 8000;
const webSocketServer = require('websocket').server;
const http = require('http');
const hostname = '192.168.1.4';
const crypto = require('crypto');
// Spinning the http server and the websocket server.
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

server.listen(webSocketsServerPort, hostname,() => {
  console.log(`Server open on port ${webSocketsServerPort}/`);
});

const wsServer = new webSocketServer({
  httpServer: server
});

connections = []

let requestcounter = 0;

wsServer.on("request",(request)=>{
	console.log(`Websocket request recieved (request no. ${requestcounter} )`)
	let connection = request.accept(null,request.origin)
	let senderid = request.httpRequest.url.split("/")[1]
	console.log(senderid)
	let hasconnection = connections.find(function(connection){
		return connection.senderid === senderid;	
	});
	if (typeof hasconnection !=='undefined'){
		console.log("already connected")
		console.log(hasconnection.senderid)
	}else{
		console.log("adding connection")
		connections.push({senderid:senderid,connection:connection})
	}
	
	connection.on('message', function (message){
		let msgData = JSON.parse(message.utf8Data)
		console.log("Recieved message: \""+msgData.message+"\"")
		console.log(msgData)
		let createDate = new Date()
		console.log(createDate)
		let responseData = {	
			messageId:crypto.randomUUID(),
			message:`Auto Response`,
			senderId:msgData.recieverId,
			chatId:msgData.chatId,
			recieverId:msgData.senderId,
			date:createDate
		}
		console.log("Recieved message: \""+responseData.message+"\"")
		console.log(responseData)
		connection.send(JSON.stringify(responseData))
		console.log("message sent")
	});
	requestcounter++;
});