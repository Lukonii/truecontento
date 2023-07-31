const constants = require("./constants");
const speech = require("@google-cloud/speech").v1p1beta1;
// const speech = require("@google-cloud/speech_v1p1beta1");
const moment = require("moment");
const fs = require("fs");
const manipulator = require("../assets/manipulator");
const { response } = require("express");

async function createSubBasic(targetDirName, subTotalSeconds) {
  console.log("Generating subtitle...");

  const client = new speech.SpeechClient();
  const config = {
    encoding: "MP3", //moze ali moram da se prebacim na tu verizju
    sampleRateHertz: 44100,
    languageCode: "en-US",
    enableWordTimeOffsets: true,
    //enableAutomaticPunctuation: true,
  };

  const audio = {
    content: fs
      .readFileSync(manipulator.getFilePath(targetDirName, "audio.mp3"))
      .toString("base64"),
  };

  const request = {
    config: config,
    audio: audio,
  };

  let text = "";
  let subtitleLength = 0;
  const [response] = await client.recognize(request);

  const wordListObj = equateResultingTextWithOriginal(targetDirName, response);
  wordListObj.forEach((wordInfo) => {
    ++subtitleLength;
    text += subtitleLength + "\n";
    if (wordInfo.startTime < 10) {
      text += "00:00:0" + wordInfo.startTime + "00";
    } else {
      text += "00:00:" + wordInfo.startTime + "00";
    }

    text += " --> ";
    if (wordInfo.endTime < 10) {
      text += "00:00:0" + wordInfo.endTime + "00";
    } else {
      text += "00:00:" + wordInfo.endTime + "00";
    }
    text += "\n";
    text += wordInfo.word.toUpperCase() + "\n\n";
    //console.log(wordInfo.word);
  });
  subTotalSeconds.val =
    parseInt(wordListObj[wordListObj.length - 1].endTime) + 1;
  //subTotalSeconds.val = 100;
  //console.log(result.alternatives[0].words);
  console.log("total sec: " + subTotalSeconds.val);
  console.log("Creating subtitle... finished");
  //console.log(text);
  return text;
}
function equateResultingTextWithOriginal(targetDirName, response) {
  let filePath = manipulator.getFilePath(targetDirName, "trimedText.txt");
  let sT = fs.readFileSync(filePath, { encoding: "utf8", flag: "r" });
  let sourceTextWithoutPunctuation = sT.split(" ");
  for (let j = 0; j < sourceTextWithoutPunctuation.length; j++) {
    sourceTextWithoutPunctuation[j] = sourceTextWithoutPunctuation[j]
      .replace(/(,|\.)+$/, "")
      .toUpperCase();
  }
  let i = 0;
  let wordList = [];
  response.results.forEach((result) => {
    result.alternatives[0].words.forEach((wordInfo) => {
      const startSecs =
        `${wordInfo.startTime.seconds}` +
        "." +
        wordInfo.startTime.nanos / 100000000;
      const endSecs =
        `${wordInfo.endTime.seconds}` +
        "." +
        wordInfo.endTime.nanos / 100000000;
      wordList.push({
        word: wordInfo.word.toUpperCase(),
        startTime: startSecs,
        endTime: endSecs,
      });
    });
  });
  // console.log(wordList);
  // console.log("---------");
  let currentIndex = 0;
  let lastNotNull;
  let wordsNotFound = 0;
  const maxWordsNotFound = 3;
  //console.log("moj text:  --- dobijeni text:");
  const updatedArrObj = sourceTextWithoutPunctuation.map((str) => {
    let startTime, endTime, indexInArrObj;
    const minLengthDiff = 5;
    //const matchingObj = wordList.find(obj => obj.word === str);
    const matchingObj = wordList
      .slice(currentIndex, currentIndex + 3)
      .find((obj, i) => {
        //console.log(str + " --- " + obj.word);
        if (
          (obj.word.includes(str) || str.includes(obj.word)) &&
          Math.abs(str.length - obj.word.length) <= minLengthDiff
        ) {
          indexInArrObj = i + currentIndex;
          return true;
        }
        return false;
      });

    if (matchingObj) {
      startTime = matchingObj.startTime;
      endTime = matchingObj.endTime;
      currentIndex = indexInArrObj + 1;
      lastNotNull = { startTime, endTime };
    } else {
      startTime = wordList[currentIndex]
        ? wordList[currentIndex].startTime
        : null;
      endTime = wordList[currentIndex] ? wordList[currentIndex].endTime : null;
      // ovaj deo sluzi da ako ne nadje neku rec da se ne gomilaju reci jedna ispod druge vec da prestane posle nekog broja
      wordsNotFound++;
      if (wordsNotFound > maxWordsNotFound) {
        currentIndex++;
        wordsNotFound = 0;
      }
      // startTime = lastNotNull ? lastNotNull.startTime : null;
      // endTime = lastNotNull ? lastNotNull.endTime : null;
      //console.log(str + " " + startTime + " " + endTime + " " + currentIndex);
      //currentIndex += 1;
    }
    return { word: str, startTime, endTime };
  });
  for (let i = 0; i < updatedArrObj.length; i++) {
    if (!updatedArrObj[i].startTime) {
      updatedArrObj[i].startTime = lastNotNull.startTime;
    }
    if (!updatedArrObj[i].endTime) {
      updatedArrObj[i].endTime = lastNotNull.endTime;
    }
    if (updatedArrObj[i].startTime && updatedArrObj[i].endTime) {
      lastNotNull = {
        startTime: updatedArrObj[i].startTime,
        endTime: updatedArrObj[i].endTime,
      };
    }
  }
  // console.log("-----");
  // console.log(updatedArrObj);
  updatedArrObj.forEach((e) => console.log(e));
  // console.log("+++++");

  return updatedArrObj;
}

async function createSubWithMultipleWords(targetDirName, subTotalSeconds) {
  console.log("Generating subtitle...");

  let filePath = manipulator.getFilePath(targetDirName, "trimedText.txt");
  let sT = fs.readFileSync(filePath, { encoding: "utf8", flag: "r" });
  let wor = sT.split(" ");
  const client = new speech.SpeechClient();
  // const filename = 'Local path to audio file, e.g. /path/to/audio.raw';
  // const encoding = 'Encoding of the audio file, e.g. LINEAR16';
  // const sampleRateHertz = 16000;
  // const languageCode = 'BCP-47 language code, e.g. en-US';

  const config = {
    encoding: "MP3", //moze ali moram da se prebacim na tu verizju
    sampleRateHertz: 44100,
    languageCode: "en-US",
    enableWordTimeOffsets: true,
    //enableAutomaticPunctuation: true,
  };

  const audio = {
    content: fs
      .readFileSync(manipulator.getFilePath(targetDirName, "audio.mp3"))
      .toString("base64"),
  };

  const request = {
    config: config,
    audio: audio,
  };
  // const a = fs
  //   .readFileSync(manipulator.getFilePath(targetDirName, "audio.mp3"))
  //   .toString("base64");
  // const aa = fs
  //   .readFileSync(manipulator.getFilePath(targetDirName, "audio.mp3"))
  //   .toString("base64");
  // console.log(a);
  // console.log(aa);
  const [response] = await client.recognize(request);
  // const [operation] = await client.recognize(request);
  // console.log(operation);
  // const [response] = await operation.promise();
  // console.log(response);
  console.log("laalalal");
  let text = "";
  let subtitleLength = 0;
  let sourceText = sT.split(" ");
  let sourceTextWithoutPunctuation = sT.split(" ");
  for (let j = 0; j < sourceTextWithoutPunctuation.length; j++) {
    sourceTextWithoutPunctuation[j] = sourceTextWithoutPunctuation[j]
      .replace(/(,|\.)+$/, "")
      .toUpperCase();
  }
  console.log("laalalal222");
  let i = 0;
  let wordList = [];
  response.results.forEach((result) => {
    result.alternatives[0].words.forEach((wordInfo) => {
      const startSecs =
        `${wordInfo.startTime.seconds}` +
        "." +
        wordInfo.startTime.nanos / 100000000;
      const endSecs =
        `${wordInfo.endTime.seconds}` +
        "." +
        wordInfo.endTime.nanos / 100000000;
      wordList.push({
        word: wordInfo.word.toUpperCase(),
        startTime: startSecs,
        endTime: endSecs,
      });
    });
  });
  console.log("laalalal333");
  //   sourceTextWithoutPunctuation i wordscopu nemaju punkuaciju
  // TODO: ovaj kod lepo radi, ali ima manu sto traiz od pocetka
  let currentIndex = 0;
  let lastNotNull;
  const updatedArrObj = sourceTextWithoutPunctuation.map((str) => {
    let startTime, endTime, indexInArrObj;
    //const matchingObj = wordList.find(obj => obj.word === str);
    const matchingObj = wordList
      .slice(currentIndex, currentIndex + 3)
      .find((obj, i) => {
        if (obj.word === str) {
          indexInArrObj = i + currentIndex;
          return true;
        }
        return false;
      });

    if (matchingObj) {
      startTime = matchingObj.startTime;
      endTime = matchingObj.endTime;
      currentIndex = indexInArrObj + 1;
      lastNotNull = { startTime, endTime };
    } else {
      startTime = wordList[currentIndex]
        ? wordList[currentIndex].startTime
        : null;
      endTime = wordList[currentIndex] ? wordList[currentIndex].endTime : null;
      // startTime = lastNotNull ? lastNotNull.startTime : null;
      // endTime = lastNotNull ? lastNotNull.endTime : null;
      currentIndex += 1;
    }
    return { word: str, startTime, endTime };
  });
  console.log("updatedArrObj.length: " + updatedArrObj.length);
  // TODO: zameni sve koji su null poslednjom vrednoscu.
  for (let i = 0; i < updatedArrObj.length; i++) {
    console.log(
      "i: " +
        i +
        " word: " +
        updatedArrObj[i].word +
        " start: " +
        updatedArrObj[i].start +
        " end: " +
        updatedArrObj[i].endTime
    );
    if (!updatedArrObj[i].startTime) {
      updatedArrObj[i].startTime = lastNotNull.startTime;
    }
    if (!updatedArrObj[i].endTime) {
      updatedArrObj[i].endTime = lastNotNull.endTime;
    }
    if (updatedArrObj[i].startTime && updatedArrObj[i].endTime) {
      lastNotNull = {
        startTime: updatedArrObj[i].startTime,
        endTime: updatedArrObj[i].endTime,
      };
    }
  }
  console.log("laalalal4444");
  subTotalSeconds.val = parseInt(wordList[wordList.length - 1].endTime) + 1; // dodamo da produzimo malo video
  //console.log('Insert AUDIO scenario to local file: scenario.txt');
  //await fs.promises.writeFile(constants.FOLDER_PATH + 'scenarioFromAudio.txt', wordsCopy, 'utf8');
  let words = updatedArrObj;
  let hasDot = false;
  for (let k = 0; k < words.length; k++, i++) {
    let oneFrameSub = "";
    let len = words.length;
    ++subtitleLength;
    text += subtitleLength + "\n";

    if (words[k].startTime < 10) {
      if (hasDot) {
        hasDot = false;
        // samo ako su vremena ista i ima tacku onda dodaj sekundu, inace nemoj
        // koristimo endtime od prethodne reci
        if (
          parseFloat(words[k - 1].endTime) >= parseFloat(words[k].startTime)
        ) {
          let dif =
            parseFloat(words[k].endTime) - parseFloat(words[k].startTime);
          if (dif > 1.3) {
            words[k].startTime = (parseFloat(words[k].startTime) + 1.3).toFixed(
              1
            );
          } else if (dif > 1.1) {
            words[k].startTime = (parseFloat(words[k].startTime) + 1.1).toFixed(
              1
            );
          } else if (dif > 0.9) {
            words[k].startTime = (parseFloat(words[k].startTime) + 0.9).toFixed(
              1
            );
          } else if (dif > 0.7) {
            words[k].startTime = (parseFloat(words[k].startTime) + 0.7).toFixed(
              1
            );
          } else if (dif > 0.5) {
            words[k].startTime = (parseFloat(words[k].startTime) + 0.5).toFixed(
              1
            );
          } else if (dif > 0.3) {
            words[k].startTime = (parseFloat(words[k].startTime) + 0.3).toFixed(
              1
            );
          } else {
            words[k].startTime = (parseFloat(words[k].startTime) + 0.1).toFixed(
              1
            );
          }
          let startTime = "00:00:0" + words[k].startTime + "00";
          text += startTime;
        } else {
          text += "00:00:0" + words[k].startTime + "00";
        }
      } else {
        text += "00:00:0" + words[k].startTime + "00";
      }
    } else {
      if (hasDot) {
        hasDot = false;
        if (
          parseFloat(words[k - 1].endTime) >= parseFloat(words[k].startTime)
        ) {
          let dif =
            parseFloat(words[k].endTime) - parseFloat(words[k].startTime);
          if (dif > 1.3) {
            words[k].startTime = (parseFloat(words[k].startTime) + 1.3).toFixed(
              1
            );
          } else if (dif > 1.1) {
            words[k].startTime = (parseFloat(words[k].startTime) + 1.1).toFixed(
              1
            );
          } else if (dif > 0.9) {
            words[k].startTime = (parseFloat(words[k].startTime) + 0.9).toFixed(
              1
            );
          } else if (dif > 0.7) {
            words[k].startTime = (parseFloat(words[k].startTime) + 0.7).toFixed(
              1
            );
          } else if (dif > 0.5) {
            words[k].startTime = (parseFloat(words[k].startTime) + 0.5).toFixed(
              1
            );
          } else if (dif > 0.3) {
            words[k].startTime = (parseFloat(words[k].startTime) + 0.3).toFixed(
              1
            );
          } else {
            words[k].startTime = (parseFloat(words[k].startTime) + 0.1).toFixed(
              1
            );
          }
          let startTime = "00:00:" + words[k].startTime + "00";
          text += startTime;
        } else {
          text += "00:00:" + words[k].startTime + "00";
        }
      } else {
        text += "00:00:" + words[k].startTime + "00";
      }
    }
    console.log("laalalal555");
    text += " --> ";
    let ssTime = parseFloat(words[k].startTime);
    let sumOfTime = 0;
    let subLen = "";
    let line = "";
    let maxLines = 2;
    let lineCount = 0;
    const frameSubtitleDuration = 1.5; // seconds
    while (sumOfTime < parseFloat("1.5") && k < len) {
      if (line.length + words[k].word.length <= 15 && lineCount < maxLines) {
        line += words[k].word.toUpperCase() + " ";
      } else {
        if (lineCount === maxLines - 1) {
          //oneFrameSub += line.trim();
          break;
        }
        oneFrameSub += line.trim() + "\n";
        line = words[k].word.toUpperCase() + " ";
        lineCount++;
      }
      sumOfTime = parseFloat(words[k].endTime) - parseFloat(ssTime);

      if (sourceText[i].includes(".") || sourceText[i].includes("?")) {
        // if (k+1 < len) {
        //   let dif = parseFloat(words[k+1].endTime) - parseFloat(words[k+1].startTime);
        //   if (dif > 0.1) {
        //     words[k].endTime = (parseFloat(words[k].endTime) + 0.1).toFixed(1);
        //   }
        // }
        hasDot = true;
        ++k;
        ++i;
        break;
      }
      ++k;
      ++i;
    }
    --k;
    --i;
    sumOfTime = 0;
    oneFrameSub += line.trim();
    oneFrameSub += "\n\n";
    if (words[k].endTime < 10) {
      if (hasDot) {
        text +=
          "00:00:0" + (parseFloat(words[k].endTime) + 0.2).toFixed(1) + "00";
      } else {
        text += "00:00:0" + words[k].endTime + "00";
      }
    } else {
      if (hasDot) {
        text +=
          "00:00:" + (parseFloat(words[k].endTime) + 0.2).toFixed(1) + "00";
      } else {
        text += "00:00:" + words[k].endTime + "00";
      }
    }
    text += "\n";
    text += oneFrameSub;
  }
  console.log("Creating subtitle... finished");
  return text;
}

module.exports = {
  createSubWithMultipleWords,
  createSubBasic,
};
