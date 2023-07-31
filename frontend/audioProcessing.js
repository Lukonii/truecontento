// const btnMale = document.getElementById('btn-male')
// const btnFemale = document.getElementById('btn-female')

// btnMale.addEventListener('click', function () {
//   toggleSelectionMale()
// })
// btnFemale.addEventListener('click', function () {
//   toggleSelectionFemale()
// })

// function toggleSelectionMale () {
//   if (!btnMale.classList.contains('btn-gender-selected')) {
//     if (btnFemale.classList.contains('btn-gender-selected')) {
//       btnFemale.classList.remove('btn-gender-selected')
//       btnFemale.classList.add('btn-gender')
//     }
//     btnMale.classList.remove('btn-gender')
//     btnMale.classList.add('btn-gender-selected')
//   }
// }
// function toggleSelectionFemale () {
//   if (!btnFemale.classList.contains('btn-gender-selected')) {
//     if (btnMale.classList.contains('btn-gender-selected')) {
//       btnMale.classList.remove('btn-gender-selected')
//       btnMale.classList.add('btn-gender')
//     }
//     btnFemale.classList.remove('btn-gender')
//     btnFemale.classList.add('btn-gender-selected')
//   }
// }
var buttons = document.querySelectorAll("span[data-group='group1']");

buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    buttons.forEach(function (btn) {
      if (btn === button) {
        btn.classList.remove("btn-audio");
        btn.classList.add("btn-audio-selected");
      } else {
        if (btn.classList.contains("btn-audio-selected")) {
          btn.classList.add("btn-audio");
          btn.classList.remove("btn-audio-selected");
        }
      }
    });
  });
});

function playAudio(audioVoice) {
  var player = document.getElementById(audioVoice);
  sessionStorage.setItem("audioVoice", audioVoice);
  // Prikazivanje playera za odgovarajući audio fajl
  player.innerHTML =
    '<audio class="w-100" style="max-height:30px;" controls src="audio/' +
    audioVoice +
    '.mp3"></audio>';
}
