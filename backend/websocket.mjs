//imports
import express from "express";
import cors from "cors";

const app = express();

// following coursework
import { server as WebSocketServer } from "websocket";

//ReferenceError: http is not defined
import http from "http";

const server = http.createServer(app);
const webSocketServer = new WebSocketServer({ httpServer: server });

const port = 3000;
app.use(cors());

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

// import express from "express";
// import cors from "cors";
// import { on } from "events";
// import { text } from "body-parser"; issue with this so replaced with express

// const app = express();
// const port = 3000;
// because server was not working
// const port = process.env.PORT || 3000;
// app.use(cors());

const messages = [
	{
		id: 1,
		username: "Kaska",
		msgText: "Hey people, how are you doing?",
		timestamp: Date.now(),
		likesCount: 0,
		dislikesCount: 0,
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

		const newMessage = {
			id: newId,
			msgText: body.msgText,
			username: body.username,
			timestamp: Date.now(),
			//updated initialised
			likesCount: 0,
			dislikesCount: 0,
		};

		messages.push(newMessage);

		while (callbacksForNewMessages.length > 0) {
			const callback = callbacksForNewMessages.pop();
			callback([newMessage]);
		}

		res.send("ok");
	});
});

//add liking disliking route
app.post("/vote", (req, res) => {
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
			// !("username" in body) ||
			// !("msgText" in body)
			//getting by id and vote type
			!("id" in body) ||
			!("vote" in body)
		) {
			console.error(
				// `Failed to extract username and message text from body: ${bodyString}`
				`Failed to extract id and vote type.`
			);
			res
				.status(400)
				.send(
					"Expected body to be a JSON object containing keys uis and vote type."
				);
			return;
		}
		//this part is post new message only

		// body.msgText = body.msgText.trim().replace(/[^a-zA-Z0-9,.;:?! ]/g, "");
		// body.username = body.username.trim().replace(/[^a-zA-Z0-9,.;:?! ]/g, "");

		// if (!body.msgText || !body.username) {
		// 	res.status(400).send("Please add a quote and an username.");
		// 	return;
		// }

		// if (body.msgText.length > 400 || body.username.length > 40) {
		// 	res
		// 		.status(400)
		// 		.send(
		// 			"Message text must be up to 400 chars and username must be less than 40 chars."
		// 		);
		// 	return;
		// }

		// // to add new id to message
		// const newId = messages.length + 1;

		// //add likes and dislikes

		// const newMessage = {
		// 	id: newId,
		// 	msgText: body.msgText,
		// 	username: body.username,
		// 	timestamp: Date.now(),
		// 	//updated initialised
		// 	likesCount: 0,
		// 	dislikesCount: 0,
		// };

		// messages.push(newMessage);

		// while (callbacksForNewMessages.length > 0) {
		// 	const callback = callbacksForNewMessages.pop();
		// 	callback([newMessage]);
		// }

		//grab currently liked disliked message

		//add like and dislike
		const likeOrDislike = () => {
			for (const message of messages) {
				if (message.id === body.id) {
					return message;
				}
				// } return "No message with this id"; bug wrong because returns string and 404 doesnt show
			}
			return null;
		};
		const currentyLikedDislikedMsg = likeOrDislike();

		if (!currentyLikedDislikedMsg) {
			res.status(404).send("No message with this id.");
			return;
		}

		if (body.vote === "like") {
			currentyLikedDislikedMsg.likesCount += 1;
			currentyLikedDislikedMsg.timestamp = Date.now();
		} else if (body.vote === "dislike") {
			currentyLikedDislikedMsg.dislikesCount += 1;
			currentyLikedDislikedMsg.timestamp = Date.now();
		} else {
			//here to add invalid vote type
			res.status(400).send("Invalid vote type.");
			return;
		}

		//copy from the other post to update
		while (callbacksForNewMessages.length > 0) {
			const callback = callbacksForNewMessages.pop();
			// callback([newMessage]);
			callback([currentyLikedDislikedMsg]);
		}

		// res.send("ok"); // this is wrong and message instead
		res.json(currentyLikedDislikedMsg);
	});
});

// this was not working with websocket

// app.listen(port, () => {
// 	console.error(`Chat server listening on port ${port}`);
// });
server.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
