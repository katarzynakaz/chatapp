import express from "express";
import cors from "cors";
import { on } from "events";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

const messages = [
	{
		id: 1,
		username: "Kaska",
		msgText: "Hey guys!",
		timestamp: Date.now(),
		likesCount: 0,
		dislikesCount: 0,
	},
];

let globalIdCounter = 2;

//helper to filter recent messages
const getRecentMessages = (sinceTime) => {
	const since = parseInt(sinceTime);
	if (since) {
		return messages.filter((msg) => msg.timestamp > since);
	}
	return messages;
};

//get all messages
app.get("/", (req, res) => {
	res.json(messages);
});

//get recent messages poll
app.get("/messages", (req, res) => {
	res.json(getRecentMessages(req.query.since));
});

//messages with long polling only
const callbacksForNewMessages = [];

app.get("/long-poll", (req, res) => {
	let messagesToSend = [];

	if (req.query.since) {
		messagesToSend = getRecentMessages(req.query.since);
	}

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

		const newId = globalIdCounter++;

		//newMessage obnj to send to long poll so instead of above
		const newMessage = {
			id: newId,
			msgText: body.msgText,
			username: body.username,
			timestamp: Date.now(),
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
		if (typeof body != "object" || !("id" in body) || !("vote" in body)) {
			console.error(`Failed to extract id and vote type.`);
			res
				.status(400)
				.send(
					"Expected body to be a JSON object containing keys uis and vote type."
				);
			return;
		}

		//add like and dislike
		const likeOrDislike = () => {
			for (const message of messages) {
				if (message.id === body.id) {
					return message;
				}
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

		while (callbacksForNewMessages.length > 0) {
			const callback = callbacksForNewMessages.pop();
			callback([currentyLikedDislikedMsg]);
		}

		res.json(currentyLikedDislikedMsg);
	});
});

app.listen(port, () => {
	console.error(`Chat server listening on port ${port}`);
});
