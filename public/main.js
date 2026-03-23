const message = document.getElementById("msg");
const form = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const chatMain = document.querySelector(".chat-main");
const socket = io(); 

const ul = document.createElement("ul");
chatMessages.appendChild(ul);

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const msgText = message.value.trim();
    if (!msgText) return;

    socket.emit('chatMessage', {
        sender: myUsername,
        text: msgText
    });

    message.value = "";
});

// main.js - Update this function
function createMessageElement(msg) {
    const li = document.createElement("li");

    // 1. Determine if it's sent or received for alignment
    if (msg.sender === myUsername) {
        li.classList.add("sent");
    } else {
        li.classList.add("received");
    }

    // 2. Add the specific user class for coloring (lowercase to match CSS)
    const userClass = `user-${msg.sender.toLowerCase()}`;
    li.classList.add(userClass);

    const textSpan = document.createElement("span");

    textSpan.textContent = `${msg.sender}: ${msg.text}`;

    const timeSpan = document.createElement("span");
    timeSpan.classList.add("timestamp");
    const ts = new Date(msg.timestamp || Date.now());
    const hours = ts.getHours().toString().padStart(2, "0");
    const minutes = ts.getMinutes().toString().padStart(2, "0");
    timeSpan.textContent = ` [${hours}:${minutes}]`;

    li.appendChild(textSpan);
    li.appendChild(timeSpan);

    ul.appendChild(li);
    chatMain.scrollTop = chatMain.scrollHeight;
}

// New message from server
socket.on("message", (msg) => {
    createMessageElement(msg);
});

// Load message history
socket.on("messageHistory", (messages) => {
    messages.forEach(msg => createMessageElement(msg));
});

// Login
const loginForm = document.getElementById("login-form");
const loginContainer = document.getElementById("login-container");
const chatContainer = document.querySelector(".chat-container");
let myUsername = "";

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const res = await fetch("/login", {
        method: "POST",
        body: new URLSearchParams(formData)
    });
    const data = await res.json();
    if (data.success) {
        myUsername = data.username;
        loginContainer.style.display = "none";
        chatContainer.style.display = "flex";
        socket.emit("requestHistory");
    } else {
        document.getElementById("login-error").textContent = data.message;
    }
});

// Dark mode toggle
const darkModeToggle = document.getElementById("darkModeToggle");
darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});