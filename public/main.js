const message = document.getElementById("msg");
const form = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const chatMain = document.querySelector(".chat-main");
const socket = io(); 
let username = prompt("Enter your name:");
if (!username) username = "Anonymous";

const ul = document.createElement("ul");
chatMessages.appendChild(ul);

// form.addEventListener("submit", (e) => {
//     e.preventDefault();

//     const msgText = message.value.trim();
//     if (msgText === "" || !msgText) return;

//     const li = document.createElement("li");
//     li.textContent = msgText;

//     ul.appendChild(li);

//     message.value = "";
//     chatMain.scrollTop = chatMain.scrollHeight;

// });

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const msgText = message.value.trim();
    if (!msgText) return;

    // Send object with text and sender
    socket.emit('chatMessage', {
        sender: username,
        text: msgText
    });

    message.value = "";
});

socket.on('message', (msg) => {
    const li = document.createElement('li');
    li.textContent = `${msg.sender}: ${msg.text}`;

    // Add class if the message is from me
    if (msg.sender === username) li.classList.add('sent');

    ul.appendChild(li);
    chatMain.scrollTop = chatMain.scrollHeight;
});
