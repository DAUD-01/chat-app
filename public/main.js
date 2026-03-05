const message = document.getElementById("msg");
const form = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const chatMain = document.querySelector(".chat-main");


const ul = document.createElement("ul");
chatMessages.appendChild(ul);

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const msgText = message.value.trim();
    if (msgText === "") return;

    const li = document.createElement("li");
    li.textContent = msgText;

    ul.appendChild(li);

    message.value = "";
    chatMain.scrollTop = chatMain.scrollHeight;

});

console.log("hello")