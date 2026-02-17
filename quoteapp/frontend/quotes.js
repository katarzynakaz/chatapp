const quote = document.getElementById("quote");
const author = document.getElementById("author");
const newQuoteBtn = document.getElementById("new-quote");
const addQuoteBtn = document.getElementById("add-quote");
const addQuoteAuthor = document.getElementById("add-quote-author");
const addQuoteText = document.getElementById("add-quote-text");
const confirmToUser = document.getElementById("confirm-to-user");

const url = "http://localhost:3000/";

// generatequote and show to user
const generateQuote = async () => {
//   const selectedQuote = pickFromArray(quotes);
    const response = await fetch (url)
    const selectedQuote = await response.json();
    quote.innerHTML = selectedQuote.quote;
    author.innerHTML = selectedQuote.author;
  // change greeting
  document.getElementById("greeting").innerHTML = "Your quote is:";
  document.getElementById("greeting").style = "size: 1rem";
};

//show to user on click of new quote
newQuoteBtn.addEventListener("click", generateQuote);


const addQuote = async () => {
    //emovinf whitespace or special characters
    const newQuoteText = addQuoteText.value.trim().replace(/[^a-zA-Z0-9,.;:?! ]/g, "");
    const newQuoteAuthor = addQuoteAuthor.value.trim().replace(/[^a-zA-Z0-9,.;:?! ]/g, ""); 

    //check if empty or too long
    if (!newQuoteText|| !newQuoteAuthor) {
        confirmToUser.innerHTML = "Please add a quote and an author.";
        return;
    } 
    
    if (newQuoteText.length > 250 || newQuoteAuthor.length > 40) {
        confirmToUser.innerHTML = "Quote must be up to 250 chars and author must be less than 40 chars.";
        return;
    }

    //bacekedn here
    // app.post("/", (req, res) => {
    // const bodyBytes = [];
    // req.on("data", chunk => bodyBytes.push(...chunk));
    // req.on("end", () => {
    //     const bodyString = String.fromCharCode(...bodyBytes);
    //     let body;
    //     try {
    //     body = JSON.parse(bodyString);
    //     } catch (error) {
    //     console.error(`Failed to parse body ${bodyString} as JSON: ${error}`);
    //     res.status(400).send("Expected body to be JSON.");
    //     return;
    //     }
    //     if (typeof body != "object" || !("quote" in body) || !("author" in body)) {
    //     console.error(`Failed to extract quote and author from post body: ${bodyString}`);
    //     res.status(400).send("Expected body to be a JSON object containing keys quote and author.");
    //     return;
    //     }
    //     quotes.push({
    //     quote: body.quote,
    //     author: body.author,
    //     });
    //     res.send("ok");
    // });
    // });

    // so macthes backend (typeof body != "object" || !("quote" in body) || !("author" in body)) 
    const addingQuote = {
            quote: newQuoteText,    
            author: newQuoteAuthor,
    };

    const responseFromAdd = await fetch (url, {
        method: "POST",
        headers: {
            //so backedn can parde body as json 
            "Content-Type": "application/json",
        },
        //turn obj into str typeof body != "object" 
        body: JSON.stringify(addingQuote)
    });

    // quotes.push(newQuoteAuthor, newQuoteText); - rhtis alsready in the backed so no need
    // tell user
    if (responseFromAdd.ok === true) {
        confirmToUser.innerHTML = "Your quote has been added.";
        //clear input 
        addQuoteText.value = "";
        addQuoteAuthor.value = "";
} else {
    //take error message frrom response grab from heree 
    //     console.error(`Failed to extract quote and author from post body: ${bodyString}`);
    //     res.status(400).send("Expected body to be a JSON object containing keys quote and author.");
    //     return;
    const errorToShow = await responseFromAdd.text()
    confirmToUser.innerHTML = `${errorToShow} Please try again.`;
}
}

addQuoteBtn.addEventListener("click", addQuote);


