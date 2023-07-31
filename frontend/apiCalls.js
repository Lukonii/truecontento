const topic = document.getElementById("topic");
const topicBtn = document.getElementById("btn-get-text-disabled");
const topicOutput = document.getElementById("topic-result");
const loader = document.getElementById("loader");
const loader2 = document.getElementById("loader2");
const keywordsParagraph = document.getElementById("keywords-paragraph");
const keywordsList = document.getElementById("keywords-list");
const imageBtn = document.getElementById("btn-get-images-disabled");
const videoBtn = document.getElementById("btn-get-video");
const videoPlayer = document.getElementById("videoPlayer");
const imgModal = document.getElementById("modal-image");
const vertic = document.getElementById("vertic");
const btnModal = document.getElementById("modal-btn");
const btnModalDismiss = document.getElementById("modal-dismiss");
const btnModalDownload = document.getElementById("modal-download");

const baseUrl = "http://localhost:3000";

topicBtn.addEventListener("click", getText);
imageBtn.addEventListener("click", getImages);
videoBtn.addEventListener("click", getVideo);
let areImgesExist = false;
let isVideoGenerated = false;

btnModalDismiss.onclick = function () {
  videoModal.style.display = "none";
};

btnModalDownload.onclick = function () {
  const videoUrl = videoPlayer.src;
  const link = document.createElement("a");
  link.href = videoUrl;
  let videoName = "unnamed.mp4";
  if (topic.value !== "") {
    videoName = topic.value + ".mp4";
  }
  link.download = videoName;
  link.click();
};

async function getVideo(e) {
  e.preventDefault;
  if (!areImgesExist) {
    alert("Generate topic or images first.");
    return;
  }
  if (topicOutput.value.length < 100) {
    alert("Minimum text length is 100 characters!");
    return;
  }
  videoModal.style.display = "block";
  const dir = sessionStorage.getItem("directory");
  const audioVoice = sessionStorage.getItem("audioVoice");
  if (audioVoice === null) {
    alert("Please select voice for your video!");
    return;
  }
  const captionFont = sessionStorage.getItem("captionFont");
  const captionColor = sessionStorage.getItem("captionColor");
  const captionOverlay = sessionStorage.getItem("captionOverlay");
  const captionPosition = sessionStorage.getItem("captionPosition");
  const topicText = sessionStorage.getItem("topicTextEdited");
  if (!captionFont || !captionColor) {
    alert("Please select caption style first!");
    return;
  }
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email");
  const param = {
    audioVoice: audioVoice,
    directory: dir,
    captionColor: captionColor,
    captionFont: captionFont,
    captionOverlay: captionOverlay,
    captionPosition: captionPosition,
    topicText: topicText,
    email: email,
  };
  if (isVideoGenerated) {
    return;
  }
  await fetch(baseUrl + "/api/get-video", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(param),
  })
    .then((response) => response.blob())
    .then((videoBlob) => {
      const videoUrl = URL.createObjectURL(videoBlob);
      videoPlayer.src = videoUrl;
      // sessionStorage.setItem("videoUrl", videoUrl);
      imgModal.classList.add("ease-out");
      setTimeout(function () {
        imgModal.style.display = "none";
        vertic.style.display = "none";
        videoPlayer.style.display = "block";
        btnModal.style.display = "block";
        isVideoGenerated = true;
        //videoPlayer.classList.add('ease-in')
      }, 1000);
      updateShowingCredits();
    });
  // .then(data => {
  //   const video = data.video
  //   const encoder = new TextEncoder()
  //   const dataAsText = encoder.encode(data)
  //   console.log(new Buffer.from(data.video, 'base64').toString('ascii'))
  //   videoPlayer.src = `data:video/mp4;base64,${video}`
  //   videoPlayer.controls = true
  //   imgModal.classList.add('ease-out')
  //   setTimeout(function () {
  //     imgModal.style.display = 'none'
  //     videoPlayer.style.display = 'block'
  //     btnModal.style.display = 'block'
  //     //videoPlayer.classList.add('ease-in')
  //   }, 1000)
  // })
}

async function getImages(e) {
  e.preventDefault();
  let imageLetter = sessionStorage.getItem("previewImageLetter");
  let imageNumber = sessionStorage.getItem("previewImageNumber");
  let imageAspectRatio = sessionStorage.getItem("aspectRatio");
  let topicText = sessionStorage.getItem("topicTextEdited");

  if (!imageLetter || !imageNumber || !imageAspectRatio) {
    alert("Fisrt choose photo ratio or style.");
    return;
  }
  if (areImgesExist) {
    return;
  }
  // proveri da li ima sacuvan ime direktorijuma
  let dir = sessionStorage.getItem("directory");
  if (!dir) {
    alert("There is an error please realod page.");
    return;
  }
  loader2.style.display = "block";
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email");
  const param = {
    imageLetter: imageLetter,
    imageNumber: imageNumber,
    imageAspectRatio: imageAspectRatio,
    directory: dir,
    email: email,
    topicText: topicText,
  };
  console.log("-----------");
  await fetch(baseUrl + "/api/get-images", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(param),
  })
    .then((response) => response.json())
    .then((data) => {
      loader2.style.display = "none";
      for (const image of data) {
        const imgElement = document.createElement("img");
        imgElement.src = image;
        imgElement.classList.add(
          "col-3",
          "col-md-3",
          "col-lg-2",
          "rounded",
          "p-0",
          "m-2",
          "gen-img"
        );
        document.querySelector(".generated-images").appendChild(imgElement);
      }
      imageBtn.id = "btn-get-images-disabled";
      areImgesExist = true;
    })
    .catch((error) => {
      console.error(error.message);
    });
}

async function getText(e) {
  e.preventDefault();
  if (topic.value.length < 5) {
    alert("Topic is to short!");
    return;
  }
  if (topicOutput.value !== "") {
    if (confirm("This action will rewrite text from textbox!") == false) {
      return;
    }
  }
  console.log("111");
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email");
  let currDirName = sessionStorage.getItem("directory");
  if (currDirName == "") {
    console.log("nema currDirName kreira");
    await createDir();
    currDirName = sessionStorage.getItem("directory");
  }
  const param = { topic: topic.value, currDirName: currDirName, email: email };
  loader.style.display = "block";
  console.log(param);
  await fetch(baseUrl + "/api/get-topic", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(param),
  })
    .then((response) => {
      console.log("222");
      return response.json();
    })
    .then((data) => {
      console.log("333");
      console.log(data);
      //saveToLocalstorage(data.currDirName);
      topicOutput.value = data.result;
      //sessionStorage.setItem("topicTextEdited", data.result);
      //topicOutput.disabled = false; // ovo cemo da uradimo kada budemo hteli da omogucimo edit
      loader.style.display = "none";
      keywordsParagraph.innerHTML = data.keywords;
      keywordsList.style.display = "block";
      topicBtn.id = "btn-get-text-disabled";
      console.log(data);
    })
    .catch((error) => {
      console.error(error);
    });
}
function saveToLocalstorage(directory) {
  // save dir name
  let retrievedString = localStorage.getItem("directory");
  if (retrievedString != null) {
    localStorage.removeItem("directory");
  }
  localStorage.setItem("directory", directory);
}
//document.addEventListener("DOMContentLoaded", createDir());
window.onload = createDir();
async function createDir() {
  const token = localStorage.getItem("token");
  fetch(baseUrl + "/api/get-dir", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      sessionStorage.setItem("directory", data);
    });
}
function updateShowingCredits() {
  var cr = localStorage.getItem("availableCredits");
  var br = parseInt(cr);
  br = br - 1;
  localStorage.setItem("availableCredits", br);

  document.getElementById("availCredits").innerHTML = br + " credits";
}
