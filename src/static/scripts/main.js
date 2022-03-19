const fullscreen = document.querySelector("#fullscreen");
const fullscreenCloseButton = document.querySelector("#fullscreen-close");
const fullscreenIframe = document.querySelector("#fullscreen-iframe");

function displayFullscreen(url) {
    fullscreen.style.display = "block";
    document.body.classList.add("fullscreen")
    fullscreenIframe.src = url;
}

function hideFullscreen() {
    fullscreen.style.display=  "none";
    document.body.classList.remove("fullscreen")
}

fullscreenCloseButton.addEventListener("click", hideFullscreen);

function displayLogin() {
    displayFullscreen("/signin")
}

window.addEventListener("message", (e) => {
    if (e.data === "connected") {
        window.location.href = window.location.href;
    }
})