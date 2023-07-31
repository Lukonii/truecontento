const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const util = require("util");

async function createDir() {
  const newDirName = generateId();
  const directory = path.join(__dirname, newDirName);
  fs.mkdirSync(directory);
  fs.mkdirSync(directory + "/images");
  console.log("manipulator: dir created...");
  return newDirName;
}

// async function createDir(text) {
//   const newDirName = generateId();
//   const directory = path.join(__dirname, newDirName);
//   fs.mkdirSync(directory);
//   fs.mkdirSync(directory + "/images");
//   const filePath = path.join(directory, "text.txt");
//   const fileData = text;
//   const fd = fs.openSync(filePath, "w");
//   fs.writeSync(fd, fileData);
//   fs.closeSync(fd);
//   console.log("manipulator: text saved...");
//   return newDirName;
// }
async function insertDataIntoFile(currDirName, text) {
  const filePath = path.join(getDirPath(currDirName), "text.txt");
  const fileData = text;
  const fd = fs.openSync(filePath, "w");
  fs.writeSync(fd, fileData);
  fs.closeSync(fd);
  console.log("manipulator: text saved...");
}
function getDirPath(targetDirName) {
  return path.join(__dirname, targetDirName);
}
async function createTrimedTextFile(targetDirName, trimedText) {
  const directory = path.join(__dirname, targetDirName);
  const filePath = path.join(directory, "trimedText.txt");
  const fileData = trimedText;
  const fd = fs.openSync(filePath, "w");
  fs.writeSync(fd, fileData);
  fs.closeSync(fd);
  console.log("manipulator: Trimed text saved...");
}
async function saveKeywords(targetDirName, keywords) {
  const directory = path.join(__dirname, targetDirName);
  const filePath = path.join(directory, "keywords.txt");
  const fileData = keywords;
  const fd = fs.openSync(filePath, "w");
  fs.writeSync(fd, fileData);
  fs.closeSync(fd);
  console.log("manipulator: Keywords saved...");
}
async function saveSub(targetDirName, subtitle) {
  const directory = path.join(__dirname, targetDirName);
  const filePath = path.join(directory, "subtitle.srt");
  const fileData = subtitle;
  const fd = fs.openSync(filePath, "w");
  fs.writeSync(fd, fileData);
  fs.closeSync(fd);
  console.log("manipulator: Subtitle saved...");
}

function generateId() {
  let randomNumber = crypto.randomBytes(4).toString("hex");
  let currentTime = Date.now();
  let newDirName = randomNumber + currentTime;
  return newDirName;
}
function copyLastImage(directory) {
  lastImage = path.join(__dirname, directory, "images", "image5.png");
  newImage = path.join(__dirname, directory, "images", "image6.png");
  fs.copyFileSync(lastImage, newImage);
}

function getImagesPath(directory) {
  return path.join(__dirname, directory, "images");
}
function getFilePath(targetDirName, fileName) {
  return path.join(__dirname, targetDirName, fileName);
}

async function isDirExist(targetDirName) {
  const directory = path.join(__dirname, targetDirName);
  if (fs.existsSync(directory)) {
    return true;
  } else {
    console.log("Folder does not exist");
    return false;
  }
}
function getRootDir() {
  return path.resolve(__dirname, "..");
}
async function getKeywords(targetDirName) {
  const directory = path.join(__dirname, targetDirName);
  const filePath = path.join(directory, "keywords.txt");
  try {
    const data = fs.readFileSync(filePath, { encoding: "utf8", flag: "r" });
    return data;
  } catch (err) {
    console.error(err);
  }
}

async function getTrimedText(targetDirName) {
  const directory = path.join(__dirname, targetDirName);
  const filePath = path.join(directory, "trimedText.txt");
  try {
    const data = fs.readFileSync(filePath, { encoding: "utf8", flag: "r" });
    //console.log(data);
    return data;
  } catch (err) {
    console.error(err);
  }
}

async function isFileExist(targetDirName, targetFileName) {
  const directory = path.join(__dirname, targetDirName);
  const filePath = path.join(directory, targetFileName);
  if (fs.existsSync(filePath)) {
    return true;
  } else {
    console.log("Folder does not exist");
    return false;
  }
}
async function removeFile(targetDirName, targetFileName) {
  const directory = path.join(__dirname, targetDirName);
  const filePath = path.join(directory, targetFileName);
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
        return false;
      }
      return true;
    });
  } else {
    console.log("Folder does not exist");
    return false;
  }
}
async function saveAudioFile(targetDirName, response) {
  const writeFile = util.promisify(fs.writeFile);
  await writeFile(
    getFilePath(targetDirName, "audio.mp3"),
    response.audioContent,
    "binary"
  );
}

module.exports = {
  createDir,
  getDirPath,
  getFilePath,
  saveKeywords,
  isDirExist,
  isFileExist,
  getImagesPath,
  getKeywords,
  getTrimedText,
  createTrimedTextFile,
  saveAudioFile,
  saveSub,
  getRootDir,
  insertDataIntoFile,
  removeFile,
  copyLastImage,
};
