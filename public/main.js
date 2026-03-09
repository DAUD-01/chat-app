const message = document.getElementById("msg");
const form = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const chatMain = document.querySelector(".chat-main");
const socket = io(); 
const userColors = {
    "dawood": "sent",
    "rayyan": "sent",
    "liyyana": "sent",
    
};
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

    const textSpan = document.createElement('span');
    textSpan.textContent = `${msg.sender}: ${msg.text}`;

    const timeSpan = document.createElement('span');
    const ts = new Date(msg.timestamp || Date.now());
    const hours = ts.getHours().toString().padStart(2, '0');
    const minutes = ts.getMinutes().toString().padStart(2, '0');
    timeSpan.textContent = `${hours}:${minutes}`;
    timeSpan.classList.add('timestamp');

    li.appendChild(textSpan);
    li.appendChild(timeSpan);

    if (msg.sender === myUsername || userColors[msg.sender]) {
        li.classList.add(userColors[msg.sender]);
    }

    ul.appendChild(li);
    chatMain.scrollTop = chatMain.scrollHeight;
});


// messageHistory listener

socket.on('messageHistory', (messages) => { 
    messages.forEach(msg => {
        const li = document.createElement('li');

        // Create a span for the message text
        const textSpan = document.createElement('span');
        textSpan.textContent = `${msg.sender}: ${msg.text}`;

        // Create a span for timestamp
        const timeSpan = document.createElement('span');
        const ts = new Date(msg.timestamp); // make sure your Message model has timestamp
        const hours = ts.getHours().toString().padStart(2, '0');
        const minutes = ts.getMinutes().toString().padStart(2, '0');
        timeSpan.textContent = ` [${hours}:${minutes}]`;
        timeSpan.classList.add('timestamp');

        li.appendChild(textSpan);
        li.appendChild(timeSpan);

        // Apply class based on username
        if (msg.sender === myUsername || userColors[msg.sender]) {
            li.classList.add(userColors[msg.sender]);
        }

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