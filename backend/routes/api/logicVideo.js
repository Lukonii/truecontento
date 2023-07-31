const video = require("../../generators/video");
const videoSub = require("../../generators/videoSub");
const audio = require("../../generators/audio");
const subtitle = require("../../generators/subtitle");
const emailSender = require("../../generators/emailSender");
const manipulator = require("../../assets/manipulator");
const fs = require("fs");
const logger = require("../../logger");
const topic = require("../../generators/topic");
const pool = require("../../db/db");
const queries = require("../../db/queries");

async function logicGenerateVideo(req, res) {
  // generisi audio, prevode i video
  try {
    // ako je null nije ga menjao, ako nije treba da se trimuje
    console.log(req.body.topicText);
    if (req.body.topicText) {
      // ako je vec trimovan obrisi fajl
      // trenutno ovo radim kad generisem
      // console.log("MAIN: trimming text...");
      // await manipulator.removeFile(req.body.directory, "trimedText.txt");
      // topic.trimText(req.body.directory, req.body.topicText);
    }
    console.log("MAIN: generating audio...");
    if (!(await audio.generateAudio(req.body.directory, req.body.audioVoice))) {
      res.status(500).send("Failed while generating audio from text");
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("MAIN: generating sub...");
    let subTotalSeconds = { val: 0 };
    const sub = await subtitle.createSubBasic(
      req.body.directory,
      subTotalSeconds
    );
    if (sub == null || subTotalSeconds.val == 0) {
      res.status(500).send("Failed while generating subtitle");
    }
    await manipulator.saveSub(req.body.directory, sub);
    //let subTotalSeconds = { val: 100 };
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("MAIN: generating video...");
    // ovaj deo vise ne koristim.
    // if (!(await video.getVideo(req.body.directory, subTotalSeconds))) {
    //   res.status(500).send("Failed while generating video");
    // }
    //await new Promise((resolve) => setTimeout(resolve, 1000));
    //console.log("neposredno pred gen videa sa sub");
    if (
      !(await videoSub.getVideoSubtitled(
        req.body.directory,
        subTotalSeconds,
        req.body.captionColor,
        req.body.captionFont,
        req.body.captionOverlay,
        req.body.captionPosition
      ))
    ) {
      res.status(500).send("Error while creating subVideo");
    }

    const filePath = manipulator.getFilePath(
      req.body.directory,
      "videoWSub.mp4"
    );
    logger.logUserAction(req.body.email, "generated video");
    console.log(filePath);
    //const emailSent = false;
    const emailSent = await emailSender.sendEmail(
      req.body.email,
      req.body.directory
    );
    console.log(req.body.email);
    console.log(req.body.directory);
    await pool.query(queries.updateCreditsForEmail, [req.body.email, -1]);
    await pool.query(queries.addCreatedVideoHistory, [
      req.body.email,
      req.body.directory,
      emailSent,
    ]);
    res.sendFile(filePath, {}, (err) => {
      if (err) {
        logger.logUserAction(req.body.email, "video NOT sent on website");
        console.log("Error while sending video on website");
      } else {
        logger.logUserAction(req.body.email, "video sent on website");
        console.log("Sent:", filePath);
      }
    });
  } catch (error) {
    res.status(500).send(error);
  }
}

module.exports = logicGenerateVideo;
