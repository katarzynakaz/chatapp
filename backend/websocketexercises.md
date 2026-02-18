Exercises

How will you make sure that your client won’t miss any new messages, after getting the initial messages? Write down your strategy.

When the client loads, first fetch all messages array with the get request like in the previous task.
Then open WS to listen rather than doing the long polling to receive new messages in real-time. Use the implemented timestamp so only the new meesages get populated.

Think: What advantages does each approach have?

Http - It works and is relaible, after setting up not too complicated to test.
Websocket - instant messages with no need to send repeated requests.

Why might we want to change our implementation to use a WebSocket for sending messages?

Makes it more real time and less delay for the users.

Why might we want to keep using POST requests for sending messages?

It's more straightforward and works for occasionally sent messages, like in ths fake chat app.

Why might we want to support both on our server? Why might we only want to support one on our server?

Using both gives flexibility if ws is not available.
One makes the implementation easier.

Think about what information a client would need to provide to a server in order to like/dislike a message.
Which message is liked/disliked, is it like or dislike.

Think about what information a server would need to provide to a client in order to display how many likes/dislikes a message has.
Which messge it is, how many likes and dislikes it has.

Think about what information a server would need to provide to a client in order to update how many likes/dislikes a message has.
Message is and update like and dislike numbers.

Write down some advantages and disadvantages of a server -> client update being “+1 compared to before” or “now =10”.
Just change is noted with + so less data compared to =.

- may not be up to date.

Choose which approach you want to take.
Show total number of likes and dislikes.

Implement liking and disliking messages:
If a message has a non-zero number of likes or dislikes, the frontend needs to show this.
The frontend needs to expose some way for a user to like or dislike any message.
Heart to like and count number next to for likes, thumbs down for dislike.

When a user likes or dislikes a message, the frontend needs to tell the backend about this, and the backend needs to notify all clients of this.
When a frontend is notified by a backend about a new like or dislike, it needs to update the UI to show this.
You may do this in your polling implementation, WebSockets implementation, or both.
Websocket server listens on new messages and also changed to timestamp part of message. If message is liked/disliked, send message gets updated timestamp. grabbed by id, since timestamp is new message rendered with updated count shows to user.
so:
fetch all old get http
open websocket - new message and like/dislike = new timestamp -> show
