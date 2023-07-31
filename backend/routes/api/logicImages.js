const images = require("../../generators/images");
const manipulator = require("../../assets/manipulator");
const logger = require("../../logger");
const topic = require("../../generators/topic");
const topicChanged = require("../../generators/topicChanged");
const logicText = require("./logicText");

// u ovom fajlu su sve rute koje zovu drugu fajlove za preracune
async function logicGenerateImages(req, res) {
  //TODO: imagePromt - ovog vise nema i treba zameniti console.log(req.body.imagePromt);
  // if (!manipulator.isDirExist(req.body.directory)) {
  //   console.log('Directory does not exist')
  //   res.status(500).send(new Error('Directory does not exist'))
  // }
  // if (!manipulator.isFileExist(req.body.directory, 'keywords.txt')) {
  //   console.log('Keywords file does not exist')
  //   res.status(500).send(new Error('Keywords file does not exist'))
  // }
  if (req.body.topicText) {
    await topicChanged.topicChanged(req.body.directory, req.body.topicText);
  }
  try {
    await images.generateImages(
      req.body.directory,
      req.body.imageLetter,
      req.body.imageNumber,
      req.body.imageAspectRatio
    );
  } catch (error) {
    return res.status(500).send(error);
  }
  try {
    const generatedImages = await images.sendImages(req.body.directory);
    logger.logUserAction(req.body.email, "generated images");
    return res.send(JSON.stringify(generatedImages));
  } catch (error) {
    logger.logUserAction(req.body.email, error);
    if (error.message === "Folder is empty") {
      return res.status(404).send(error.message);
    } else {
      return res.status(500).send(error.message);
    }
  }
}

module.exports = logicGenerateImages;
