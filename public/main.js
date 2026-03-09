const message = document.getElementById("msg");
const form = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const chatMain = document.querySelector(".chat-main");
const socket = io(); 
// let username = prompt("Enter your name:");
// if (!username) username = "Anonymous";

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

// Use myUsername instead of username
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const msgText = message.value.trim();
    if (!msgText) return;

    // Send object with text and sender
    socket.emit('chatMessage', {
        sender: myUsername, // changed from username
        text: msgText
    });

    message.value = "";
});

socket.on('message', (msg) => {
    const li = document.createElement('li');
    li.textContent = `${msg.sender}: ${msg.text}`;

    // Add class if the message is from me
    if (msg.sender === myUsername) li.classList.add('sent'); // changed from username

    ul.appendChild(li);
    chatMain.scrollTop = chatMain.scrollHeight;
});

socket.on('messageHistory', (messages) => { // to load history of messages
    messages.forEach(msg => {
        const li = document.createElement('li');
        li.textContent = `${msg.sender}: ${msg.text}`;
        if(msg.sender === myUsername) li.classList.add('sent'); // changed from username
        ul.appendChild(li);
    });
    chatMain.scrollTop = chatMain.scrollHeight;
});

// Login Page 

const loginForm = document.getElementById('login-form');
const loginContainer = document.getElementById('login-container');
const chatContainer = document.querySelector('.chat-container');
let myUsername = ''; // store username for later messages

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const res = await fetch('/login', {
        method: 'POST',
        body: new URLSearchParams(formData)
    });
    const data = await res.json();
    if (data.success) {
        myUsername = data.username;
        loginContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
    } else {
        document.getElementById('login-error').textContent = data.message;
    }
});