const getStarted = document.getElementById("get-started");
const getStartedTry = document.getElementById("get-started-try");
const audio = new Audio("https://www.fesliyanstudios.com/play-mp3/11");

getStarted.addEventListener("click", getStartedFetch);
getStartedTry.addEventListener("click", getStartedFetch);

function getStartedFetch() {
  const token = localStorage.getItem("token");
  //var playPromise = audio.play();
  if (!token) {
    window.location.href = "/auth.html";
    return;
  }
  window.location.assign("/generate-video.html");
}
