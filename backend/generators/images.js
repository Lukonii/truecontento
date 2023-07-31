const https = require("https");
const manipulator = require("../assets/manipulator");
const fs = require("fs");
const stabilityApi = require("./stabilityApiCall");

async function generateImages(
  targetDirName,
  imageLetter,
  imageNumber,
  aspectRatio
) {
  let kw = "";
  await manipulator.getKeywords(targetDirName).then(function (data) {
    kw = data;
  });
  if (kw.endsWith(".")) {
    kw = kw.slice(0, -1);
  }

  const keywords = kw.split(",");
  console.log("Downloading images...");
  const imageProps = {
    targetDir: manipulator.getImagesPath(targetDirName),
    style: "",
    prompt: "",
    height: 0,
    width: 0,
    imageIndex: 1,
  };
  const imgPrompt = generatePromt(imageProps, imageLetter, imageNumber);
  calculateAspectRatio(imageProps, aspectRatio);
  for (let i = 0; i < 5; i++) {
    try {
      imageProps.prompt = imgPrompt;
      addKeyWordToPrompt(imageProps, keywords[i]);
      imageProps.imageIndex = i + 1;
      await callGetImageForThisLine(imageProps);
    } catch (error) {
      return Promise.reject(error);
    }
  }
  manipulator.copyLastImage(targetDirName);
  console.log("Downloading images... finished");
}
function addKeyWordToPrompt(imageProps, keyword) {
  imageProps.prompt = imageProps.prompt.replace(
    "KEYWORDTOCHANGE",
    "(" + keyword + ")"
  );
  return;
}
function calculateAspectRatio(imageProps, aspectRatio) {
  if (aspectRatio === "4:5") {
    imageProps.height = 640;
    imageProps.width = 512;
  } else if (aspectRatio === "4:3") {
    imageProps.height = 512;
    imageProps.width = 683;
  } else if (aspectRatio === "2:3") {
    imageProps.height = 768;
    imageProps.width = 512;
  } else if (aspectRatio === "4:7") {
    imageProps.height = 896;
    imageProps.width = 512;
  } else {
    imageProps.height = 512;
    imageProps.width = 512;
  }

  return;
}
function generatePromt(imageProps, imageLetter, imageNumber) {
  imageProps.style = findValueById(imageLetter);
  const prompt = findValueById(imageNumber);
  return prompt;
}
function findValueById(id) {
  const jsonContent = fs.readFileSync("./generators/imagePrompts.json");
  const data = JSON.parse(jsonContent);
  const result = data.find((obj) => obj.id === id);
  if (result) {
    return result.value;
  } else {
    return null; // ili neku drugu vrednost koju želite vratiti ako id nije pronađen
  }
}
let tries = 0;
async function callGetImageForThisLine(imageProps) {
  try {
    return await getImageForThisLine(imageProps);
  } catch (error) {
    console.log(error);
    if (tries < 5) {
      tries++;
      return await callGetImageForThisLine(imageProps);
    } else {
      tries = 0;
      console.log("Number of recursive calls exceeded. IMAGES");
      return new Error("Number of recursive calls exceeded. IMAGES");
    }
  }
}

async function getImageForThisLine(imageProps) {
  return await stabilityApi.getImage(imageProps); // generate-images
}
async function downloadImage(targetDirName, imageUrl, i) {
  https.get(imageUrl, (response) => {
    response.pipe(
      fs.createWriteStream(
        manipulator.getImagesPath(targetDirName) + "/image" + i + ".jpg"
      )
    );
  });
}

async function sendImages(directory) {
  const images = [];
  const imagesPath = manipulator.getImagesPath(directory);
  try {
    const files = await fs.promises.readdir(imagesPath);
    if (files.length === 0) {
      return Promise.reject(new Error("Folder is empty"));
    } else {
      for (let i = 0; i < files.length - 1; i++) {
        const file = files[i];
        images.push("/assets/" + directory + "/images/" + file);
      }
    }
  } catch (err) {
    console.log(err);
    return Promise.reject(new Error("Error reading images directory"));
  }
  return images;
}

module.exports = { generateImages, sendImages };
