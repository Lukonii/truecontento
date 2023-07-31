const manipulator = require("../assets/manipulator");
const logicText = require("../routes/api/logicText");
const topic = require("./topic");

async function topicChanged(dir, userTopic) {
  // kljucne reci
  if (manipulator.isFileExist(dir, "keywords.txt")) {
    console.log("obrisao stare kljucne reci");
    manipulator.removeFile(dir, "keywords.txt");
  }
  console.log("dohvacam nove kljucen reci");
  const keywords = await logicText.callKeywords(userTopic);
  console.log("sacuvam keyword u fajl");
  await manipulator.saveKeywords(dir, keywords.result);
  // update text
  if (manipulator.isFileExist(dir, "text.txt")) {
    console.log("obrisao text");
    manipulator.removeFile(dir, "text.txt");
  }
  await manipulator.insertDataIntoFile(dir, userTopic);
  // tim updated text
  if (manipulator.isFileExist(dir, "trimedText.txt")) {
    console.log("obrisao stare trimovani text");
    manipulator.removeFile(dir, "trimedText.txt");
  }
  console.log("trimuijem text");
  await topic.trimText(dir, userTopic);
}

module.exports = { topicChanged };
