const chatFeedDiv = document.getElementById("chat-feed");
const fullMsgInChat = document.querySelector(".div-for-each-msg");
const msgInChat = document.querySelector(".msg-text-in-chat-view");
const usernameInChat = document.querySelector(".username-in-chat-view");

const refreshBtn = document.getElementById("refresh-btn");
const sendBtn = document.getElementById("send-msg-btn");
const pollBtn = document.getElementById("poll-btn");

const addMsgUsernameInput = document.getElementById("add-msg-username");
const addMsgTextInput = document.getElementById("add-msg-text");
const confirmToUser = document.getElementById("confirm-to-user");

// const url = "http://localhost:3000";
const url = "https://katchatapp.hosting.codeyourfuture.io";

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
	chatFeedDiv.innerHTML = "";
	allMessages.forEach((msg) => {
		chatFeedDiv.innerHTML += `
            <div class="div-for-each-msg">
                <p class="msg-in-chat-view">${msg.msgText}</p>
                <p class="username-in-chat-view">${msg.username}</p>
            </div>`;
	});
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

	// quotes.push(newQuoteAuthor, newQuoteText); - rhtis alsready in the backed so no need
	// tell user
	if (responseFromAdd.ok === true) {
		confirmToUser.innerHTML = "Your message has been sent.";
		//clear input
		addMsgTextInput.value = "";
		addMsgUsernameInput.value = "";
	} else {
		//take error message frrom response grab from heree
		//     console.error(`Failed to extract quote and author from post body: ${bodyString}`);
		//     res.status(400).send("Expected body to be a JSON object containing keys quote and author.");
		//     return;
		const errorToShow = await responseFromAdd.text();
		confirmToUser.innerHTML = `${errorToShow} Please try again.`;
	}
};

sendBtn.addEventListener("click", sendMsg);

// auto refresh
// setInterval(seeAllMessages, 2000);

//polling coursework
// const keepFetchingMessages = async () => {
//     const lastMessageTime = state.messages.length > 0 ? state.messages[state.messages.length - 1].timestamp : null;
//     const queryString = lastMessageTime ? `?since=${lastMessageTime}` : "";
//     const url = `${server}/messages${queryString}`;
//     const rawResponse = await fetch(url);
//     const response = await rawResponse.json();
//     state.messages.push(...response);
//     render();
//     setTimeout(keepFetchingMessages, 100);
// }

let messages = [];
const state = { messages: [] };

//render defining from coursework example build from
const render = () => {
	chatFeedDiv.innerHTML = "";
	state.messages.forEach((msg) => {
		chatFeedDiv.innerHTML += `
            <div class="div-for-each-msg">
                <p class="msg-in-chat-view">${msg.msgText}</p>
                <p class="username-in-chat-view">${msg.username}</p>
            </div>`;
	});
};

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
	state.messages.push(...response);
	render();
	testLongPoll();
};
longPollBtn.addEventListener("click", testLongPoll);

//addiitonal privacy feature hide messages
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
