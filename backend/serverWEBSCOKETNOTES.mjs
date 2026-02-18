import express from "express";
import cors from "cors";
import { on } from "events";
// import { text } from "body-parser"; issue with this so replaced with express
import { server as WebSocketServer } from "websocket";

const app = express();
// const port = 3000;
// because server was not working
const port = process.env.PORT || 3000;
app.use(cors());

const server = http.createServer(app);
const webSocketServer = new WebSocketServer({ httpServer: server });

const messages = [
	{
		id: 1,
		username: "annonymous",
		msgText: "First chat message",
		timestamp: Date.now(),
	},
];

//now with added poling since last id
// from fe
// const keepFetchingMessages = async () => {
//     const lastSeenId = messages.length > 0 ? messages[messages.length - 1].id : null;
//     const queryString = lastSeenId ? `?since=${lastSeenId}` : "";
//     const server = url
//     const urlofserv = `${server}messages${queryString}`;
//     const rawResponse = await fetch(urlofserv);
//     const response = await rawResponse.json();
//     messages.push(...response);
//     // render();
//     seeAllMessages();
//     setTimeout(keepFetchingMessages, 100);
// }

// });
//get all messages
app.get("/", (req, res) => {
	res.json(messages);
});

//get recent messages poll
app.get("/messages", (req, res) => {
	//sincetimestapm Teach your backend how to answer “since when” queries.
	const since = parseInt(req.query.since);
	if (since) {
		const onlyRecentMsgs = messages.filter((msg) => msg.timestamp > since);
		res.json(onlyRecentMsgs);
		return;
	}
	//keep if no since and show all
	res.json(messages);
});

//messages with long polling only
const callbacksForNewMessages = [];
app.get("/long-poll", (req, res) => {
	let messagesToSend = [];

	//since from messages get
	const since = parseInt(req.query.since);
	if (since) {
		messagesToSend = messages.filter((msg) => msg.timestamp > since);
	}

	//from coursework pasted
	// Now, if 'since' was provided but no NEW messages were found,
	// messagesToSend.length will be 0, and the server will WAIT.
	if (messagesToSend.length === 0) {
		callbacksForNewMessages.push((value) => res.send(value));
	} else {
		res.send(messagesToSend);
	}
});

//add msg to chat
app.post("/", (req, res) => {
	const bodyBytes = [];
	req.on("data", (chunk) => bodyBytes.push(...chunk));
	req.on("end", () => {
		const bodyString = String.fromCharCode(...bodyBytes);
		let body;
		try {
			body = JSON.parse(bodyString);
		} catch (error) {
			console.error(`Failed to parse body ${bodyString} as JSON: ${error}`);
			res.status(400).send("Expected body to be JSON.");
			return;
		}
		if (
			typeof body != "object" ||
			!("username" in body) ||
			!("msgText" in body)
		) {
			console.error(
				`Failed to extract username and message text from body: ${bodyString}`
			);
			res
				.status(400)
				.send(
					"Expected body to be a JSON object containing keys username and message text."
				);
			return;
		}
		//here add the checks on backedn 400

		body.msgText = body.msgText.trim().replace(/[^a-zA-Z0-9,.;:?! ]/g, "");
		body.username = body.username.trim().replace(/[^a-zA-Z0-9,.;:?! ]/g, "");

		if (!body.msgText || !body.username) {
			res.status(400).send("Please add a quote and an username.");
			return;
		}

		if (body.msgText.length > 400 || body.username.length > 40) {
			res
				.status(400)
				.send(
					"Message text must be up to 400 chars and username must be less than 40 chars."
				);
			return;
		}

		// to add new id to message
		const newId = messages.length + 1;

		// messages.push({
		//   id: newId,
		//   msgText: body.msgText,
		//   username: body.username,
		//   timestamp: Date.now(),
		// });
		//newMessage obnj to send to long poll so instead of above
		const newMessage = {
			id: newId,
			msgText: body.msgText,
			username: body.username,
			timestamp: Date.now(),
		};

		messages.push(newMessage);

		while (callbacksForNewMessages.length > 0) {
			const callback = callbacksForNewMessages.pop();
			callback([newMessage]);
		}

		res.send("ok");
	});
});

app.listen(port, () => {
	console.error(`Chat server listening on port ${port}`);
});


//websocket instance 
websocket.addEventListener("open", () => {
	log("CONNECTED");
	pingInterval = setInterval(() => {
		log(`SENT: ping: ${counter}`);
		websocket.send("ping");
	}, 1000);
});

//send msg t server 
websocket.addEventListener("open", () => {
	log("CONNECTED");
	pingInterval = setInterval(() => {
		log(`SENT: ping: ${counter}`);
		websocket.send("ping");
	}, 1000);
});

//receive msg from server
websocket.addEventListener("message", (e) => {
  log(`RECEIVED: ${e.data}: ${counter}`);
  counter++;
});

//server send s json websocket.addEventListener("message", (e) => {
  const message = JSON.parse(e.data);
  log(`RECEIVED: ${message.iteration}: ${message.content}`);
  counter++;
});

websocket.addEventListener("close", () => {
  log("DISCONNECTED");
  clearInterval(pingInterval);
});





// notes from websoket 
//on server js we do this:
// this is for ws package not npm notes

// const WebSocket = require("ws");
// const server = new WebSocket.Server({ port: 8080 });

//first event is connection from client
// server.on('connection')

//when connection made access to web s object and callback
//this is ws library only again, api is diffferent

// server.on("connection", (socket) => { //ws automatically accepts a connection

// 	// we can listen to incoming messages - text and handle in callback
// 	socket.on("message", (message) => {
// 		//also send message back to clinet
// 		socket.send(`Message received: ${message}`);
// 	});
// });

//using websocket package it is:
//receives a request object
// webSocketServer.on("request", (request) => {

//     //call accept to open  connection
// 	const connection = request.accept(null, request.origin);

// 	//sendUTF to send text
// 	connection.sendUTF("Hello");

// 	connection.on("message", (message) => {
// 		console.log("Received:", message.utf8Data);
// 	});
// });

// following coursework
import { server as WebSocketServer } from "websocket";
const server = http.createServer(app);
const webSocketServer = new WebSocketServer({ httpServer: server });

// npm install websocket
//following this

//when client wants to connect to webscoket server sends a request object
webSocketServer.on("request", (request) => {
	//call accept to open  connection
    //accept client connection and gives connection consts to talk to client
	const connection = request.accept(null, request.origin);

	//sendUTF to send text
    //sends msg immediately from server when connected
	connection.sendUTF("Hello from server");

    //this is a listener for messages from client
	connection.on("message", (message) => {
		console.log("Msg from client", message.utf8Data);
	});
});



//on client side code we have a built in websocket class built in
// instantiate with url that points to server
const socket = new WebSocket("ws://localhost:8080");

//trigger handshake to open connection
// and we listen to it as event
socket.onmessage = ({ data }) => {
	console.log("Message from server ", data);
};

document.querySelector(".send-btn").addEventListener("click", () => {
	socket.send("Hello from client!");
});

//full duplex connection
