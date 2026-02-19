// There must be an endpoint which handles POST requests.
// A middleware should look for a header with name X-Username. If this is set, it will modify req to add a username property set to this value. If it is not set, the property should be set to null.
// A middleware should parse the request POST body as a JSON array. It should modify req to add a body property to this value. If the POST body was not a JSON array, or the array contains non-string elements, it should reject the request.
// The response should look like:

const express = require("express");
// const cors = require("cors");

const app = express();
app.use(express());

// app.use(cors());

//helpers middleware functions
// A middleware should look for a header with name X-Username.
// If this is set, it will modify req to add a username property set to this value.
// If it is not set, the property should be set to null.

// const requestTime = function (req, res, next) {
// 	req.requestTime = Date.now();
// 	next();
// };
// const addUsernameProp = function (req, res, next) {
//   const username = req.get("X-Username");

//   if (username) {
//     req.username = username;
//   } else {
//     req.username = null;
//   }

//   next();
// };

const addUsernameProp = function (req, res, next) {
	const username = req.get("X-Username");

	username ? (req.username = username) : (req.username = null);

	next();
};

//to turn to obj
const getBody = function (req, res, next) {
	let data = "";
	req.on("data", (chunk) => {
		data += chunk;
	});
	req.on("end", () => {
		req.body = JSON.parse(data);
		next();
	});
};
// A middleware should parse the request POST body as a JSON array. It should modify req to add a body property to this value.
// If the POST body was not a JSON array, or the array contains non-string elements, it should reject the request.
const parseBody = function (req, res, next) {
	const body = req.body;
	getBody();
	//check if is array and all strings typeof wrong for array
	if (!Array.isArray(body)) {
		return res.send("Not an array");
	}

	body.forEach((elementInArr) => {
		if (typeof elementInArr !== "string") {
			return res.status(400).send("Not all are strings");
		}
	});
	next();
};

app.use(addUsernameProp);
app.use(parseBody);

// app.get("/", (req, res) => {
// 	let responseText = "Hello World!<br>";
// 	responseText += `<small>Requested at: ${req.requestTime}</small>`;
// 	res.send(responseText);
// });

// You are authenticated as Gemma.

// You have requested information about 0 subjects.

app.post("/", (req, res) => {
	let responseText = "";

	if (req.username) {
		responseText += `You are authenticated as ${req.username}.<br><br>`;
	} else {
		responseText += `You are not authenticated.<br><br>`;
	}

	const subject = req.body;
	const numberOfS = subject.length === 1 ? "subject" : "subjects";
	const showSubject = subject.join(", ");
	const numOfSubj = subject.length;
	responseText += `You have requested information about ${numOfSubj} ${numberOfS}: ${showSubject}.`;

	res.send(responseText);
});

const port = 3000;
app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
