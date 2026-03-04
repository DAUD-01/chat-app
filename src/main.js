const message = document.getElementById("msg")
const submit = document.getElementById("submit")

submit.addEventListener("click", (e) => {
    e.preventDefault();

    console.log(message.value.toString());

    message.value = "";
})