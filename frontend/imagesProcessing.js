var buttons1 = document.querySelectorAll("span[data-group='imagesGroup1']");
var buttons2 = document.querySelectorAll("span[data-group='imagesGroup2']");

function setDefaultValuesCaption() {
  sessionStorage.setItem("captionColor", "&Hf5f5f5");
  sessionStorage.setItem("captionOverlay", "25");
  sessionStorage.setItem("captionPosition", "10");
  sessionStorage.setItem("captionFont", "Impact");
}
setDefaultValuesCaption();

buttons1.forEach(function (button) {
  button.addEventListener("click", function () {
    buttons1.forEach(function (btn) {
      if (btn === button) {
        btn.classList.remove("btn-image1");
        btn.classList.add("btn-image1-selected");
      } else {
        if (btn.classList.contains("btn-image1-selected")) {
          btn.classList.add("btn-image1");
          btn.classList.remove("btn-image1-selected");
        }
      }
    });
  });
});
buttons2.forEach(function (button) {
  button.addEventListener("click", function () {
    buttons2.forEach(function (btn) {
      if (btn === button) {
        btn.classList.remove("btn-image2");
        btn.classList.add("btn-image2-selected");
      } else {
        if (btn.classList.contains("btn-image2-selected")) {
          btn.classList.add("btn-image2");
          btn.classList.remove("btn-image2-selected");
        }
      }
    });
  });
});

function previewImage1(letter) {
  var previewImagePlaceholder = document.getElementById(
    "previewImagePlaceholder"
  );
  sessionStorage.setItem("previewImageLetter", letter);

  var number = sessionStorage.getItem("previewImageNumber");
  if (!number) {
    sessionStorage.setItem("previewImageNumber", "1");
    number = "1";
  }
  let imgBtn = document.getElementById("btn-get-images-disabled");
  if (document.getElementById("btn-get-images-disabled") !== null) {
    imgBtn.id = "btn-get-images";
  }
  previewImagePlaceholder.innerHTML =
    '<img src="images/' +
    letter +
    number +
    '.png" alt=' +
    letter +
    number +
    ' class="img-fluid">';
}

function previewImage2(number) {
  var previewImagePlaceholder = document.getElementById(
    "previewImagePlaceholder"
  );
  sessionStorage.setItem("previewImageNumber", number);

  var letter = sessionStorage.getItem("previewImageLetter");
  if (!letter) {
    sessionStorage.setItem("previewImageLetter", "a");
    letter = "a";
  }
  let imgBtn = document.getElementById("btn-get-images-disabled");
  if (document.getElementById("btn-get-images-disabled") !== null) {
    imgBtn.id = "btn-get-images";
  }
  previewImagePlaceholder.innerHTML =
    '<img src="images/' +
    letter +
    number +
    '.png" alt=' +
    letter +
    number +
    ' class="img-fluid">';
}
function addFocus(element, aspectRatio) {
  var focusedElements = document.getElementsByClassName("focused");
  for (var i = 0; i < focusedElements.length; i++) {
    focusedElements[i].classList.remove("focused");
  }
  element.classList.add("focused");
  sessionStorage.setItem("aspectRatio", aspectRatio);
}
const captionExampleBox = document.getElementById("captionExampleBox");
const captionExampleText = document.getElementById("captionExampleText");

function addFocusCaption(element, color, colHex) {
  var focusedElements = document.getElementsByClassName("focusedCaption");
  for (var i = 0; i < focusedElements.length; i++) {
    focusedElements[i].classList.remove("focusedCaption");
  }
  element.classList.add("focusedCaption");
  sessionStorage.setItem("captionColor", color);
  captionExampleBox.style.color = colHex;
}

function addFocusFont(element, font) {
  var focusedElements = document.getElementsByClassName("focusedFont");
  for (var i = 0; i < focusedElements.length; i++) {
    focusedElements[i].classList.remove("focusedFont");
  }
  element.classList.add("focusedFont");
  sessionStorage.setItem("captionFont", font);

  captionExampleBox.style.fontFamily = font;
}
function captionTextPosition(captionPosition) {
  sessionStorage.setItem("captionPosition", captionPosition);
  if (captionPosition == "6") {
    captionExampleText.style.top = "10%";
  } else if (captionPosition == "10") {
    captionExampleText.style.top = "50%";
  } else {
    captionExampleText.style.top = "90%";
  }
}

const captionOverlay = document.getElementById("captionOverlay");

captionOverlay.addEventListener("input", (event) => {
  const captionSliderValue = event.target.value;
  const captionOverlayOpacity = document.getElementById(
    "captionOverlayOpacity"
  );
  sessionStorage.setItem("captionOverlay", captionSliderValue);
  if (captionSliderValue == "0") {
    captionOverlayOpacity.style.opacity = "0";
  } else if (captionSliderValue == "25") {
    captionOverlayOpacity.style.opacity = "0.25";
  } else if (captionSliderValue == "50") {
    captionOverlayOpacity.style.opacity = "0.5";
  } else {
    captionOverlayOpacity.style.opacity = "0.75";
  }
});
