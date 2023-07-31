const router = require("express").Router();
const topic = require("../../generators/topic");
const keyword = require("../../generators/keyword");
const manipulator = require("../../assets/manipulator");
const logger = require("../../logger");

let countLogicText = 0;
async function logicGenerateText(req, res) {
  try {
    // get data for topic
    countLogicText = 0;
    const data = await callGetText(req.body);
    console.log(data);
    // create folder and save topic data
    //const currDirName = await manipulator.createDir(data.result);
    await manipulator.insertDataIntoFile(req.body.currDirName, data.result);
    //data.currDirName = currDirName;
    // dodajem u datu jer je vec data objekat
    console.log("----");
    countLogicText = 0;
    const keywords = await callKeywords(data.result);
    data.keywords = keywords.result;
    await manipulator.saveKeywords(req.body.currDirName, keywords.result);
    await topic.trimText(req.body.currDirName, data.result);
    console.log(data);
    logger.logUserAction(req.body.email, "generated topic");
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
}
async function callGetText(userTopic) {
  try {
    return await topic.getText(userTopic);
  } catch (error) {
    console.error(error);
    // obrada greške
    if (countLogicText < 5) {
      countLogicText++;
      return await callGetText(userTopic);
    } else {
      console.log("Number of recursive calls exceeded. TOPIC");
      return Promise.reject(
        new Error("Number of recursive calls exceeded. TOPIC: " + error)
      );
    }
  }
}

async function callKeywords(data) {
  try {
    return await keyword.getKeywords(data);
  } catch (error) {
    console.error(error);
    // obrada greške
    if (countLogicText < 5) {
      countLogicText++;
      return await callKeywords(data);
    } else {
      console.log("Number of recursive calls exceeded. KEYWORD");
      return Promise.reject(
        new Error("Number of recursive calls exceeded. KEYWORD: " + error)
      );
    }
  }
}

module.exports = { logicGenerateText, callKeywords };
