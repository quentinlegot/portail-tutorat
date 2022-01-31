

const loginButton = document.querySelector("#login-button");

loginButton.addEventListener('click', () => {
    displayFullscreen("/signin")
})

window.addEventListener("message", (e) => {
    if (e.data === "connected") {
        window.location.href = window.location.href;
    }
})