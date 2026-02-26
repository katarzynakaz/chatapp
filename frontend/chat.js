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

const socket = new WebSocket("ws://localhost:3000");
// live url // const url = "https://katchatapp.hosting.codeyourfuture.io";

socket.onmessage = ({ data }) => {
	console.log("Message from server ", data);
};

testWsBtn.addEventListener("click", () => {
	socket.send("Hello from client!");
});

const seeAllMessages = async () => {
	const response = await fetch(url);
	const allMessages = await response.json();

	state.messages = allMessages;

	render();
};

refreshBtn.addEventListener("click", seeAllMessages);

const sendMsg = async () => {
	const addMsgText = addMsgTextInput.value
		.trim()
		.replace(/[^a-zA-Z0-9,.;:?! ]/g, "");
	const addMsgUsername = addMsgUsernameInput.value
		.trim()
		.replace(/[^a-zA-Z0-9,.;:?! ]/g, "")
		.toUpperCase();

	if (!addMsgText || !addMsgUsername) {
		confirmToUser.textContent = "Please add message text and your username.";
		return;
	}

	if (addMsgText.length > 400 || addMsgUsername.length > 40) {
		confirmToUser.textContent =
			"Message must be up to 400 chars and username must be less than 40 chars.";
		return;
	}

	const addingMsg = {
		msgText: addMsgText,
		username: addMsgUsername,
	};

	const responseFromAdd = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(addingMsg),
	});

	if (responseFromAdd.ok === true) {
		confirmToUser.textContent = "Your message has been sent.";

		addMsgTextInput.value = "";
		addMsgUsernameInput.value = "";
	} else {
		const errorToShow = await responseFromAdd.text();
		confirmToUser.textContent = `${errorToShow} Please try again.`;
	}
};

sendBtn.addEventListener("click", sendMsg);

const state = { messages: [] };
chatFeedDiv.addEventListener("click", async (event) => {
	const isLike = event.target.classList.contains("like-btn");
	const isDislike = event.target.classList.contains("dislike-btn");

	if (!isLike && !isDislike) return;

	const msgDiv = event.target.closest(".div-for-each-msg");
	const messageId = msgDiv.dataset.id;
	const voteType = isLike ? "like" : "dislike";

	const response = await fetch(`${url}/vote`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ id: messageId, vote: voteType }),
	});

	if (response.ok) {
		console.log(`${voteType} sent successfully for ID: ${messageId}`);
	}
});

//WS UPDATE render with added likes and dislikes and by id
function render() {
	chatFeedDiv.innerHTML = "";
	state.messages.forEach((msg) => {
		const messageDiv = document.createElement("div");
		messageDiv.className = "div-for-each-msg";
		messageDiv.dataset.id = msg.id;

		const msgText = document.createElement("p");
		msgText.className = "msg-in-chat-view";
		msgText.textContent = msg.msgText;

		const username = document.createElement("p");
		username.className = "username-in-chat-view";
		username.textContent = msg.username;

		const buttonDiv = document.createElement("div");
		buttonDiv.className = "likedislike-div";

		buttonDiv.innerHTML = `
            <button class="like-btn">Like</button>
            <p class="likes-count">Liked ${msg.likesCount}</p>
            <button class="dislike-btn">Dislike</button>
            <p class="dislikes-count">Disliked ${msg.dislikesCount}</p>
        `;

		messageDiv.append(msgText, username, buttonDiv);
		chatFeedDiv.appendChild(messageDiv);
	});
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

	response.forEach((incomingMsgFromServer) => {
		const isDuplicate = state.messages.some(
			(msgAlreadyOnScreen) => msgAlreadyOnScreen.id === incomingMsgFromServer.id
		);

		if (!isDuplicate) {
			state.messages.push(incomingMsgFromServer);
		} else {
			state.messages.forEach((msgOnScreen) => {
				if (msgOnScreen.id === incomingMsgFromServer.id) {
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

// seeAllMessages(); with long poll:
seeAllMessages().then(() => {
	testLongPoll();
});
