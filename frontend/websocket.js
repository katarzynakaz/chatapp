const chatFeedDiv = document.getElementById("chat-feed");
const fullMsgInChat = document.querySelector(".div-for-each-msg");
const msgInChat = document.querySelector(".msg-text-in-chat-view");
const usernameInChat = document.querySelector(".username-in-chat-view");

const refreshBtn = document.getElementById("refresh-btn");
const sendBtn = document.getElementById("send-msg-btn");
const pollBtn = document.getElementById("poll-btn");
const testWsBtn = document.getElementById("test-ws");

const addMsgUsernameInput = document.getElementById("add-msg-username");
const addMsgTextInput = document.getElementById("add-msg-text");
const confirmToUser = document.getElementById("confirm-to-user");

const url = "http://localhost:3000";

//WS UPDATE
const socket = new WebSocket("ws://localhost:3000");
// const url = "https://katchatapp.hosting.codeyourfuture.io";

socket.onmessage = ({ data }) => {
	console.log("Message from server ", data);
};

testWsBtn.addEventListener("click", () => {
	socket.send("Hello from client!");
});

// generatequote and show to user
const seeAllMessages = async () => {
	//   const selectedQuote = pickFromArray(quotes);
	const response = await fetch(url);
	const allMessages = await response.json();

	//this fixes the messages not showing on live sitwe
	state.messages = allMessages;
	// quote.innerHTML = selectedQuote.quote;
	// author.innerHTML = selectedQuote.author;
	// change greetingi am keeping everythign as is and jusy want to
	//   document.getElementById("greeting").innerHTML = "Your quote is:";
	//   document.getElementById("greeting").style = "size: 1rem";

	//WEBSOCKET this bit replaced by render() to show the newly liked and disliked
	// chatFeedDiv.innerHTML = "";
	// allMessages.forEach((msg) => {
	// 	chatFeedDiv.innerHTML += `
	//         <div class="div-for-each-msg">
	//             <p class="msg-in-chat-view">${msg.msgText}</p>
	//             <p class="username-in-chat-view">${msg.username}</p>
	//         </div>`;
	// });
	render();
};

//show to user on click of new quote
refreshBtn.addEventListener("click", seeAllMessages);

const sendMsg = async () => {
	//removing whitespace or special characters
	const addMsgText = addMsgTextInput.value
		.trim()
		.replace(/[^a-zA-Z0-9,.;:?! ]/g, "");
	const addMsgUsername = addMsgUsernameInput.value
		.trim()
		.replace(/[^a-zA-Z0-9,.;:?! ]/g, "")
		.toUpperCase();

	//check if empty or too long
	if (!addMsgText || !addMsgUsername) {
		confirmToUser.innerHTML = "Please add message text and your username.";
		return;
	}

	if (addMsgText.length > 400 || addMsgUsername.length > 40) {
		confirmToUser.innerHTML =
			"Message must be up to 400 chars and username must be less than 40 chars.";
		return;
	}

	// so macthes backend (typeof body != "object" || !("quote" in body) || !("author" in body))
	const addingMsg = {
		msgText: addMsgText,
		username: addMsgUsername,
	};

	const responseFromAdd = await fetch(url, {
		method: "POST",
		headers: {
			//so backedn can parde body as json
			"Content-Type": "application/json",
		},
		//turn obj into str typeof body != "object"
		body: JSON.stringify(addingMsg),
	});

	if (responseFromAdd.ok === true) {
		confirmToUser.innerHTML = "Your message has been sent.";

		addMsgTextInput.value = "";
		addMsgUsernameInput.value = "";
	} else {
		const errorToShow = await responseFromAdd.text();
		confirmToUser.innerHTML = `${errorToShow} Please try again.`;
	}
};

sendBtn.addEventListener("click", sendMsg);

// mesasages from the back end
// const messages = [
// 	{
// 		id: 1,
// 		username: "annonymous",
// 		msgText: "First chat message",
// 		timestamp: Date.now(),
// WS UPDATE
//  	likesCount: 0,
//     	dislikesCount: 0,
// 	},
// ];
// should become

const state = { messages: [] }; // store fecthesd messages here

// this is previosu render
// const render = () => {
// 	chatFeedDiv.innerHTML = "";
// 	state.messages.forEach((msg) => {
// 		chatFeedDiv.innerHTML += `
//             <div class="div-for-each-msg">
//                 <p class="msg-in-chat-view">${msg.msgText}</p>
//                 <p class="username-in-chat-view">${msg.username}</p>
//             </div>`;
// 	});
// };

//WS UPDATE render with added likes and dislikes and by id
//issue with render => not being hoisted so changed to normal function
function render() {
	chatFeedDiv.innerHTML = "";
	state.messages.forEach((msg) => {
		chatFeedDiv.innerHTML += `
            <div class="div-for-each-msg" data-id="${msg.id}">
                <p class="msg-in-chat-view">${msg.msgText}</p>
                <p class="username-in-chat-view">${msg.username}</p>
                <div class="likedislike-div">
                    <button class="like-btn">Like</button>
                    <p class="likes-count">Liked ${msg.likesCount}</p>
                    <button class="dislike-btn">Dislike</button>
                    <p class="dislikes-count">Disliked ${msg.dislikesCount}</p>
                </div>
            </div>`;
	});

	// add event listener to like and dislike buttons
	const likeBtn = document.querySelectorAll(".like-btn");
	const dislikeBtn = document.querySelectorAll(".dislike-btn");

	// find all buttons so all are ijn array
	likeBtn.forEach((btn, index) => {
		btn.addEventListener("click", async () => {
			// likesCount.forEach((like) => {

			// sfrom backedn - implement id and like it was in the adding msg
			// const addingMsg = {
			//  msgText: addMsgText,
			//  username: addMsgUsername,
			// };
			// here getting object

			// const responseFromAdd = await fetch(url, {
			//  method: "POST",
			//  headers: {
			//      //so backedn can parde body as json
			//      "Content-Type": "application/json",
			//  },
			//  //turn obj into str typeof body != "object"
			//  body: JSON.stringify(addingMsg),
			// });

			//grab message by index
			const message = state.messages[index];

			const votingData = {
				id: message.id,
				vote: "like",
			};

			const responseFromVote = await fetch(`${url}/vote`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(votingData),
			});

			if (responseFromVote.ok === true) {
				console.log("Vote sent successfully");
			} else {
				console.log("Vote failed");
			}
		});
	});

	//dislieke
	dislikeBtn.forEach((btn, index) =>
		btn.addEventListener("click", async (event) => {
			console.log("Dislike button clicked");

			const message = state.messages[index];

			const votingData = {
				id: message.id,
				vote: "dislike",
			};

			const responseFromVote = await fetch(`${url}/vote`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(votingData),
			});

			if (responseFromVote.ok === true) {
				console.log("Vote sent successfully");
			} else {
				console.log("Vote failed");
			}
		})
	);
}

//polling coursework
const keepFetchingMessages = async () => {
	const lastMessageTime =
		state.messages.length > 0
			? state.messages[state.messages.length - 1].timestamp
			: null;
	const queryString = lastMessageTime ? `?since=${lastMessageTime}` : "";
	const urlQueryMod = `${url}/messages${queryString}`;
	const rawResponse = await fetch(urlQueryMod);
	const response = await rawResponse.json();
	state.messages.push(...response);
	render();
	setTimeout(keepFetchingMessages, 100);
};

pollBtn.addEventListener("click", keepFetchingMessages);

//test long poll
const longPollBtn = document.getElementById("long-poll-btn");

const testLongPoll = async () => {
	const lastMessageTime =
		state.messages.length > 0
			? state.messages[state.messages.length - 1].timestamp
			: null;
	const queryString = lastMessageTime ? `?since=${lastMessageTime}` : "";
	const urlQueryMod = `${url}/long-poll${queryString}`;
	const rawResponse = await fetch(urlQueryMod);
	const response = await rawResponse.json();

	//websocket but with duplicated message when liked
	//check by id of each message if already rendered state
	// so need to do a check before remove this:
	// state.messages.push(...response);

	response.forEach((incomingMsgFromServer) => {
		// inside old messages  on screen msgAlreadyOnScreen
		const isDuplicate = state.messages.some(
			(msgAlreadyOnScreen) => msgAlreadyOnScreen.id === incomingMsgFromServer.id
		);

		if (!isDuplicate) {
			// non duplicated add it to the list
			// instead of all getting pushed after check
			// state.messages.push(...response)
			// or incomingMsgFromServer);
			state.messages.push(...response);
			// if duplicate - loop to increase count
		} else {
			// if on screen show new count shown
			state.messages.forEach((msgOnScreen) => {
				if (msgOnScreen.id === incomingMsgFromServer.id) {
					//show new count
					msgOnScreen.likesCount = incomingMsgFromServer.likesCount;
					msgOnScreen.dislikesCount = incomingMsgFromServer.dislikesCount;
					msgOnScreen.timestamp = incomingMsgFromServer.timestamp;
				}
			});
		}
	});

	render();
	testLongPoll();
};
longPollBtn.addEventListener("click", testLongPoll);

//addiitonal privacy feature hide messages from screen
const hideMessages = document.getElementById("hide-btn");

hideMessages.addEventListener("click", () => {
	if (chatFeedDiv.style.display === "none") {
		chatFeedDiv.style.display = "block";
		hideMessages.textContent = "Hide chat";
	} else {
		chatFeedDiv.style.display = "none";
		hideMessages.textContent = "Show chat";
	}
});

// seeAllMessages();
// but with long poll
seeAllMessages().then(() => {
	testLongPoll();
});
