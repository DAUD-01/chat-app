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

  socket.emit("chatMessage", {
    sender: myUsername,
    text: msgText,
  });

  message.value = "";
});

function createMessageElement(msg) {
  const li = document.createElement("li");

  if (msg.tempId) {
    li.setAttribute("data-temp-id", msg.tempId);
  }

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

  // Add clock icon if it is pending

  if (msg.status === "pending") {
    const statusIcon = document.createElement("span");
    statusIcon.classList.add("status-icon");
    statusIcon.innerHTML = `<svg 
    xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#">
    <path d="M320-160h320v-120q0-66-47-113t-113-47q-66 0-113 47t-47 113v120Zm273-407q47-47 47-113v-120H320v120q0 66 47 113t113 47q66 0 113-47ZM160-80v-80h80v-120q0-61 28.5-114.5T348-480q-51-32-79.5-85.5T240-680v-120h-80v-80h640v80h-80v120q0 61-28.5 114.5T612-480q51 32 79.5 85.5T720-280v120h80v80H160Zm320-80Zm0-640Z"/>
    </svg>`;

    li.appendChild(statusIcon);
  }

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
  messages.forEach((msg) => createMessageElement(msg));
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
    body: new URLSearchParams(formData),
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

// To clear the chat by auth user

const clearBtn = document.getElementById("clearChatBtn");

clearBtn.addEventListener("click", () => {
  // Only allow "Daud" to trigger the deletion
  if (myUsername === "Daud") {
    const confirmClear = confirm(
      "Are you sure you want to delete ALL chat history? This cannot be undone.",
    );
    if (confirmClear) {
      socket.emit("clearAllMessages");
    }
  } else {
    // Show unauthorized message for Echo, Pixel, or Nova
    alert(
      "Access Denied: administrative privileges required to clear chat history.",
    );
  }
});

// The listener for the actual UI wipe remains the same
socket.on("chatCleared", () => {
  ul.innerHTML = "";
  console.log("Chat has been cleared by an administrator.");
});

// To allow enter button to send
const messageArea = document.getElementById("msg");

messageArea.addEventListener("keydown", (e) => {
  // Check if the key pressed is 'Enter'
  if (e.key === "Enter") {
    if (e.shiftKey) {
      // Shift + Enter: Let the default behavior happen (new line)
      return;
    } else {
      e.preventDefault();
      form.dispatchEvent(new Event("submit"));
    }
  }
});

// To track pending messages

let pendingMessages = JSON.parse(localStorage.getItem("pendingMessages")) || [];

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const msgText = message.value.trim();
  if (!msgText) {
    return;
  }

  // Create an object for temorary messages
  const tempMsg = {
    tempID: Date.now().toString(),
    sender: myUsername,
    text: msgText,
    timestamp: new Date().toString(),
    status: "pending",
  };

  // Render the message immediately to sender side

  createMessageElement(tempMsg);

  // Save to local queque, and then re try to send the message

  saveAndSendMessage(tempMsg);
  message.value = " ";
});

function saveAndSendMessage(msg) {
  // if the message is offline then it will stay in pending

  if (!socket.connected) {
    localStorage.setItem("pendingMessages", JSON.stringify(pendingMessages));
  } else {
    socket.emit("chatMessage", msg);
  }
}

// clearing the pending status
socket.on("messageAccepted", (data) => {
  const messageElement = document.querySelector(
    `[data-temp-id="${data.tempID}]`,
  );
  if (messageElement) {
    messageElement.classList.remove("pending");

    const clock = messageElement.querySelector(".status-icon");
    if (clock) clock.remove();
  }
});

// Clear offline queue when the socket connects
socket.on("connect", () => {
  console.log("Reconnected! Syncing pending messages...");

  const messagesToSync =
    JSON.parse(localStorage.getItem("pendingMessages")) || [];

  messagesToSync.forEach((msg) => {
    socket.emit("chatMessage", msg);
  });

  // Clear the local queue
  localStorage.removeItem("pendingMessages");
  pendingMessages = [];
});
