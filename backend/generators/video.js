const manipulator = require("../assets/manipulator");
const videoshow = require("../node_modules/videoshow");
const fs = require("fs");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

async function getVideo(targetDirName, subTotalSeconds) {
  console.log("Generating video...");

  // ffmpeg -r 1/10 -i ./images/image%d.png -i audio.mp3 -vf "fps=25,format=yuv420p,subtitles=subtitle.srt:force_style='Alignment=10,Fontname=Arial,Outline=2,Bold=1,Fontsize=24,PrimaryColour=&H03fcff'" -c:v libx264 -c:a aac output.mp4
  // ffmpeg -r 1/5 -i ./images/image%d.png -i audio.mp3 -i overlay75.png -filter_complex "[0:v][2:v] overlay=W-w-0:H-h-0, fps=25, format=yuv420p,subtitles=subtitle.srt:force_style='Alignment=10,Fontname=Arial,Bold=1,Outline=1,ShadowColor=&HBBFFFFFF,Shadow=1,Fontsize=18,PrimaryColour=&HFFFFFF'" -c:a copy videoWSub.mp4

  // ovaj raid:
  // ffmpeg -framerate 1/5 -i ./images/image%d.png -i audio.mp3 -i overlay75_1200x1200.png -filter_complex "[0:v][2:v] overlay=W-w-0:H-h-0, fps=25, format=yuv420p,subtitles=subtitle.srt:force_style='Alignment=10,Fontname=Arial,Bold=1,Outline=1,ShadowColor=&HBBFFFFFF,Shadow=1,Fontsize=18,PrimaryColour=&HFFFFFF'" -c:a copy videoWSub.mp4
  let videoOptions = {
    fps: 25,
    loop: (subTotalSeconds.val + 1) / 5, // seconds
    transition: true,
    transitionDuration: 0.2, // seconds
    videoBitrate: 1024,
    videoCodec: "libx264",
    //videoCodec: 'mpeg4',
    size: "1024x?",
    audioBitrate: "128k",
    audioChannels: 2,
    format: "mp4",
    pixelFormat: "yuv420p",
    disableFadeOut: true,
  };
  const imagesPath = manipulator.getImagesPath(targetDirName);
  const audioPath = manipulator.getFilePath(targetDirName, "audio.mp3");
  const videoPath = manipulator.getDirPath(targetDirName) + "/video.mp4";
  if (fs.existsSync(videoPath)) {
    fs.unlinkSync(videoPath);
  }
  let imagesFileNames = new Array();
  fs.readdir(imagesPath, (err, files) => {
    if (err) {
      console.error(`Došlo je do greške pri čitanju foldera: ${err}`);
      return false;
    }
    for (let file of files) {
      //imagesFileNames.push(imagesPath + '\\' + file)
      imagesFileNames.push(imagesPath + "/" + file);
    }
    videoshow(imagesFileNames, videoOptions)
      .audio(audioPath)
      .save(videoPath)
      .on("start", function (command) {
        //console.log('ffmpeg process started:', command)
      })
      .on("error", function (err, stdout, stderr) {
        console.error("Error:", err);
        console.error("ffmpeg stderr:", stderr);
      })
      .on("end", function (output) {
        //console.log('Video created in:', output)
      });
  });
  let created = false;
  for (let i = 0; i <= 180; i++) {
    // sleep of 500 milliseconds
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (fs.existsSync(videoPath)) {
      console.log("Generating video... finished");
      created = true;
      break;
    }
  }
  return created;
}

module.exports = { getVideo };
