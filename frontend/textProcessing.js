const ttopic = document.getElementById("topic"); // variable collision
const ttopicOutput = document.getElementById("topic-result");

ttopicOutput.addEventListener("change", function () {
  const text = ttopicOutput.value;
  const length = text.length;
  sessionStorage.setItem("topicTextEdited", ttopicOutput.value);
});

ttopic.addEventListener("focus", function () {
  const text = ttopic.value;
  const length = text.length;
  let ttextBtn = document.getElementById("btn-get-text-disabled");
  if (document.getElementById("btn-get-text-disabled") !== null) {
    ttextBtn.id = "btn-get-text";
  }
});

async function suggestText() {
  const id = Math.floor(Math.random() * 50) + 1;
  const response = await fetch("./images/topicSuggestions.json");
  const jsonObj = await response.json();

  if (!jsonObj) return;

  const topic22 = jsonObj.topics.find((t) => t.id === id);
  ttopic.value = topic22.title;
  let ttextBtn = document.getElementById("btn-get-text-disabled");
  if (document.getElementById("btn-get-text-disabled") !== null) {
    ttextBtn.id = "btn-get-text";
  }
}
