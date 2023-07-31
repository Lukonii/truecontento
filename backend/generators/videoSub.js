const manipulator = require("../assets/manipulator");
const fs = require("fs");
const fse = require("fs-extra");
const os = require("os");
const { spawnSync } = require("child_process");

async function getVideoSubtitled(
  targetDirName,
  subTotalSeconds,
  color,
  font,
  captionOverlay,
  captionPosition
) {
  console.log("Generating video...");
  if (os.platform() == "win32") {
    const userDir = manipulator.getDirPath(targetDirName);
    const videoWSubPath =
      manipulator.getDirPath(targetDirName) + "\\videoWSub.mp4";
    if (fs.existsSync(videoWSubPath)) {
      fs.unlinkSync(videoWSubPath);
    }
    const overlayImagePath = manipulator.getFilePath(
      "images",
      "overlay_" + captionOverlay + ".png"
    );
    // kopiranje iz aseta ne radi pa je potrebno premestiti srt
    const sub = manipulator.getFilePath(targetDirName, "subtitle.srt");
    const sourceFile = sub;
    const newName = targetDirName + ".srt";
    const destination = manipulator.getRootDir() + "/" + newName;
    fse.copySync(sourceFile, destination);
    while (!fs.existsSync(targetDirName + ".srt")) {}
    const loop = (subTotalSeconds.val + 1) / 5;
    const psCommand = `ffmpeg -framerate 1/${loop} -i ${userDir}/images/image%d.png -i ${userDir}/audio.mp3 -i ${overlayImagePath} -filter_complex "[0:v][2:v] overlay=W-w-0:H-h-0, fps=25, format=yuv420p,subtitles=${targetDirName}.srt:force_style='Alignment=${captionPosition},Fontname=${font},Bold=1,Outline=1,ShadowColor=&HBBFFFFFF,Shadow=1,Fontsize=20,PrimaryColour=${color}'" -c:v libx264 -c:a aac ${userDir}/videoWSub.mp4 >$null 2>&1`;
    //const psCommand = `ffmpeg -r 1/${loop} -i ${userDir}/images/image%d.png -i ${userDir}/audio.mp3 -vf "fps=25,format=yuv420p,subtitles=${targetDirName}.srt:force_style='Alignment=${captionPosition},Fontname=${font},Bold=1,Outline=1,ShadowColor=&HBBFFFFFF,Shadow=1,Fontsize=18,PrimaryColour=${color}'" -c:v libx264 -c:a aac ${userDir}/videoWSub.mp4 >$null 2>&1`;
    console.log("Adding subtitle...");
    while (!fs.existsSync(destination)) {}
    let prcs = spawnSync("powershell.exe", ["-Command", psCommand]);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    if (!fs.existsSync(videoWSubPath)) {
      spawnSync("powershell.exe", ["-Command", psCommand]);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    if (fs.existsSync(destination)) {
      fs.unlinkSync(destination);
    } else {
      return false;
    }
    console.log("Adding subtitle... finished");
    return true;
  } else if (os.platform() == "linux") {
    const userDir = manipulator.getDirPath(targetDirName);
    const videoWSubPath =
      manipulator.getDirPath(targetDirName) + "/videoWSub.mp4";
    if (fs.existsSync(videoWSubPath)) {
      fs.unlinkSync(videoWSubPath);
    }
    const overlayImagePath = manipulator.getFilePath(
      "images",
      "overlay_" + captionOverlay + ".png"
    );
    // kopiranje iz aseta ne radi pa je potrebno premestiti srt
    const sub = manipulator.getFilePath(targetDirName, "subtitle.srt");
    const sourceFile = sub;
    const newName = targetDirName + ".srt";
    const destination = manipulator.getRootDir() + "/" + newName;
    fse.copySync(sourceFile, destination);
    while (!fs.existsSync(targetDirName + ".srt")) {}
    const loop = (subTotalSeconds.val + 1) / 5;
    const psCommand = `sudo ffmpeg -framerate 1/${loop} -i ${userDir}/images/image%d.png -i ${userDir}/audio.mp3 -i ${overlayImagePath} -filter_complex "[0:v][2:v] overlay=W-w-0:H-h-0, fps=25, format=yuv420p,subtitles=${targetDirName}.srt:force_style='Alignment=${captionPosition},Fontname=${font},Bold=1,Outline=1,ShadowColor=&HBBFFFFFF,Shadow=1,Fontsize=20,PrimaryColour=${color}'" -c:v libx264 -c:a aac ${userDir}/videoWSub.mp4`;
    //const psCommand = `sudo ffmpeg -r 1/${loop} -i ${userDir}/images/image%d.png -i ${userDir}/audio.mp3 -vf "fps=25,format=yuv420p,subtitles=${targetDirName}.srt:force_style='Alignment=${captionPosition},Fontname=${font},Bold=1,Outline=1,ShadowColor=&HBBFFFFFF,Shadow=1,Fontsize=18,PrimaryColour=${color}'" -c:v libx264 -c:a aac ${userDir}/videoWSub.mp4`;
    console.log("Adding subtitle...");

    while (!fs.existsSync(destination)) {}
    spawnSync("bash", ["-c", psCommand]);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    if (!fs.existsSync(videoWSubPath)) {
      spawnSync("bash", ["-c", psCommand]);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    if (fs.existsSync(destination)) {
      fs.unlinkSync(destination);
    } else {
      return false;
    }
    console.log("Adding subtitle... finished");
    return true;
  } else {
    return Promise.reject(new Error("Platform uknown"));
  }
}
module.exports = { getVideoSubtitled };
