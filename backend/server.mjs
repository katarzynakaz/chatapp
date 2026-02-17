import express from "express";
import cors from "cors";
import { on } from "events";
// import { text } from "body-parser"; issue with this so replaced with express

const app = express();
const port = 3000;
app.use(cors());
// app.use(express.json());

const messages = [
  {
    id: 1,
    username: "annonymous",
    msgText: "First chat message",
    timestamp: Date.now()
  },
  
];


// function randomQuote() {
//   const index = Math.floor(Math.random() * quotes.length);
//   return quotes[index];
// }

//view all messages
//changing "/" to "/messages" and also added to get all messages on load of page in frontend
// this was before polling
// app.get("/", (req, res) => {
//   // console.log("test");
// //   const quote = randomQuote();
//   res.json(messages);
// });

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
//get recent messages
app.get("/messages", (req, res) => {
    //sincetimestapm Teach your backend how to answer “since when” queries.
    const since = parseInt(req.query.since);
    if (since) {
        const onlyRecentMsgs = messages.filter(msg => msg.timestamp > since);
        res.json(onlyRecentMsgs);
        return;
    }
    //keep if no since and show all
    res.json(messages);
  
});

//add msg to chat
app.post("/", (req, res) => {
    
  const bodyBytes = [];
  req.on("data", chunk => bodyBytes.push(...chunk));
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
    if (typeof body != "object" || !("username" in body) || !("msgText" in body)) {
      console.error(`Failed to extract username and message text from body: ${bodyString}`);
      res.status(400).send("Expected body to be a JSON object containing keys username and message text.");
      return;
    }
    //here add the checks on backedn 400
    // // from fe
    // const newQuoteText = addQuoteText.value.trim().replace(/[^a-zA-Z0-9,.;:?! ]/g, "");
    // const newQuoteAuthor = addQuoteAuthor.value.trim().replace(/[^a-zA-Z0-9,.;:?! ]/g, ""); 
    //   if (!newQuoteText|| !newQuoteAuthor) {
    //     confirmToUser.innerHTML = "Please add a quote and an author.";
    //     return;
    // } 
    // if (newQuoteText.length > 250 || newQuoteAuthor.length > 40) {
    //     confirmToUser.innerHTML = "Quote must be up to 250 chars and author must be less than 40 chars.";
    //     return;
    // }
    body.msgText = body.msgText.trim().replace(/[^a-zA-Z0-9,.;:?! ]/g, "");
    body.username = body.username.trim().replace(/[^a-zA-Z0-9,.;:?! ]/g, "");

    if (!body.msgText || !body.username) {
      res.status(400).send("Please add a quote and an username.");
      return;
    } 

    if (body.msgText.length >400 || body.username.length > 40) {
      res.status(400).send("Message text must be up to 400 chars and username must be less than 40 chars.");
      return;
    }

    // to add new id to message
    const newId = messages.length + 1;

    messages.push({
        id: newId,
      msgText: body.msgText,
      username: body.username,
      timestamp: Date.now(),
    });
    res.send("ok");
  });
});

app.listen(port, () => {
  console.error(`Chat server listening on port ${port}`);
});