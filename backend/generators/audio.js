const manipulator = require("../assets/manipulator");
const textToSpeech = require("@google-cloud/text-to-speech");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
require("dotenv").config();

async function generateAudio(targetDirName, voice) {
  console.log("Generating audio...");
  const audioPath = manipulator.getFilePath(targetDirName, "audio.mp3");
  if (fs.existsSync(audioPath)) {
    fs.unlinkSync(audioPath);
  }
  let text = "";
  await manipulator.getTrimedText(targetDirName).then(function (data) {
    text = data;
  });
  await synthesize(targetDirName, text, voice, audioPath);
  console.log("daljee");
  let ii = 0;
  while (!fs.existsSync(audioPath)) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    ++ii;
    if (ii > 10) {
      return false;
    }
  }
  return true;
}
function findVoiceByName(name) {
  const data = fs.readFileSync(path.join(__dirname, "voices.json"));
  const objects = JSON.parse(data);
  for (let i = 0; i < objects.length; i++) {
    console.log("222");
    const voice = objects[i].voice;
    console.log(voice.name);
    console.log("name: " + name);
    if (voice.name === name) {
      console.log(voice);
      return voice;
    }
  }
  return null;
}
// ELEVEN LABS text-to-speach
async function synthesize(targetDirName, text, voiceName, audioPath) {
  const foundObject = findVoiceByName(voiceName);
  if (foundObject === null) {
    console.log("Object name for elevenlabs not found in voices.json");
    return null;
  }

  const apiKey = process.env.ELEVEN_LABS_API_KEY; // Your API key from Elevenlabs
  const voiceID = foundObject.voice_id;
  const fileName = "audio.mp3"; // The name of your audio file
  const textInput = text;
  await textToSpeech11Lab(
    apiKey,
    voiceID,
    audioPath,
    textInput,
    foundObject.voice_settings.stability,
    foundObject.voice_settings.similarity
  )
    .then((res) => {
      console.log("Generating audio by elevenlabs");
    })
    .catch((err) => console.log(err));
}

const textToSpeech11Lab = async (
  apiKey,
  voiceID,
  fileName,
  textInput,
  stability,
  similarityBoost,
  modelId
) => {
  try {
    if (!apiKey || !voiceID || !fileName || !textInput) {
      console.log("ERR: Missing parameter");
    }

    const voiceURL = `https://api.elevenlabs.io/v1/text-to-speech/${voiceID}`;
    const stabilityValue = stability ? stability : 0;
    const similarityBoostValue = similarityBoost ? similarityBoost : 0;

    const response = await axios({
      method: "POST",
      url: voiceURL,
      data: {
        text: textInput,
        voice_settings: {
          stability: stabilityValue,
          similarity_boost: similarityBoostValue,
        },
        model_id: modelId ? modelId : undefined,
      },
      headers: {
        Accept: "audio/mpeg",
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      responseType: "stream",
    });

    response.data.pipe(fs.createWriteStream(fileName));

    return {
      status: "ok",
    };
  } catch (error) {
    console.log(error);
  }
};

// GOGLE text-to-speach
// async function synthesize(targetDirName, text, voice) {
//   const client = new textToSpeech.TextToSpeechClient();

//   const request = {
//     input: { text: text },
//     voice: {
//       languageCode: "en-US",
//       name: "en-US-Neural2-J",
//     },
//     audioConfig: {
//       audioEncoding: "LINEAR16",
//       sampleRateHertz: 24000,
//       pitch: -4.0, // dubina
//       speakingRate: 1.1, // brzina
//     },
//   };

//   let [response] = await client.synthesizeSpeech(request);
//   if (response == null) {
//     [response] = await client.synthesizeSpeech(request);
//     if (response == null) {
//       console.log("Failed to get audio");
//     }
//   }
//   manipulator.saveAudioFile(targetDirName, response);
//   console.log("Generating audio...finished");
// }

module.exports = { generateAudio };
