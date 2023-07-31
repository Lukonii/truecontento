const manipulator = require("../../assets/manipulator");

async function logicGenerateDir(req, res) {
  const currDirName = await manipulator.createDir();
  res.status(200).send(JSON.stringify(currDirName));
}

module.exports = logicGenerateDir;
