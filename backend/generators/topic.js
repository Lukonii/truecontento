const { Configuration, OpenAIApi } = require("openai");
const constants = require("./constants");
const manipulator = require("../assets/manipulator");

async function getText(userTopic) {
  try {
    console.log("Getting text for: " + userTopic.topic);
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(userTopic.topic),
      temperature: 0.6,
      max_tokens: 200,
      top_p: 0.3,
      frequency_penalty: 0.5,
      presence_penalty: 0,
    });
    console.log("Getting text... finished");
    let data = { result: completion.data.choices[0].text };
    data.result = data.result.trim();
    return data;
  } catch (error) {
    if (error.response) {
      return Promise.reject(new Error(error.response));
    } else {
      console.error(`Error with OpenAI API request topic: ${error.message}`);
      return Promise.reject(new Error(error));
    }
  }
}
async function trimText(currDirName, text) {
  let tempText = text;
  // dvaput isto jer moze da pocinje dva puta sa istim "  "
  if (tempText.slice(0, 1) == " ") {
    tempText = tempText.slice(1, -1);
  }
  if (tempText.slice(0, 1) == " ") {
    tempText = tempText.slice(1, -1);
  }
  if (tempText.slice(0, 1) == " ") {
    tempText = tempText.slice(1, -1);
  }
  tempText = tempText.replace(/^\s*\d+\.\s*/gm, " ");
  tempText = tempText.replace(/\s{2,}/g, " ");
  tempText = tempText.replace(/\n/g, " "); // todo trim mozda sam ovde sjebo nesto kad sam dodao
  tempText = tempText.replace(/\(\s*(.*?)\s*\)/g, "($1)");
  if (tempText.slice(0, 1) == " ") {
    tempText = tempText.slice(1, -1);
  }
  if (tempText.slice(0, 1) == " ") {
    tempText = tempText.slice(1, -1);
  }
  manipulator.createTrimedTextFile(currDirName, tempText);
}

function generatePrompt(userTopic) {
  return (
    constants.TOPIC +
    "\n" +
    userTopic +
    "\n" +
    constants.USER_COMMAND +
    "\n" +
    constants.REPLAY_TYPE +
    "\n" +
    constants.REPLAY_FORMAT +
    "\n" +
    constants.CHATGPT
  );
}

module.exports = { getText, trimText };
