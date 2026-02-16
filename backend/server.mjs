import express from "express";
import cors from "cors";
import { text } from "body-parser";

const app = express();
const port = 3000;
app.use(cors());

const quotes = [
  {
    "id": 1,
    "username": "annonymous",
    "text": "First chat message",
  },
  
];


// function randomQuote() {
//   const index = Math.floor(Math.random() * quotes.length);
//   return quotes[index];
// }

//view all messages
app.get("/", (req, res) => {
  // console.log("test");
//   const quote = randomQuote();
  res.json(messages);
});

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
    if (typeof body != "object" || !("username" in body) || !("msgtext" in body)) {
      console.error(`Failed to extract quote and author from post body: ${bodyString}`);
      res.status(400).send("Expected body to be a JSON object containing keys quote and author.");
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
    body.quote = body.quote.trim().replace(/[^a-zA-Z0-9,.;:?! ]/g, "");
    body.author = body.author.trim().replace(/[^a-zA-Z0-9,.;:?! ]/g, "");

    // 2. Reuse your FE logic (checking body.quote instead of newQuoteText)
    if (!body.quote || !body.author) {
      res.status(400).send("Please add a quote and an author.");
      return;
    } 

    if (body.quote.length > 250 || body.author.length > 40) {
      res.status(400).send("Quote must be up to 250 chars and author must be less than 40 chars.");
      return;
    }
    
    quotes.push({
      quote: body.quote,
      author: body.author,
    });
    res.send("ok");
  });
});

app.listen(port, () => {
  console.error(`Quote server listening on port ${port}`);
});