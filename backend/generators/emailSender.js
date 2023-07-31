const nodemailer = require("nodemailer");
const manipulator = require("../assets/manipulator");
const logger = require("../logger");

async function sendEmail(userEmail, dirName) {
  // Kreiranje transporter objekta
  let transporter = nodemailer.createTransport({
    service: "Gmail", // Promenite ovo u ime e-pošte providera koji koristite
    auth: {
      user: process.env.OUR_EMAIL,
      pass: process.env.OUR_EMAIL_PASS,
    },
  });
  let videoName = "video_truecontento_" + dirName;
  await manipulator.getKeywords(dirName).then(function (data) {
    videoName = data;
  });
  // Definisanje informacija o e-pošti
  let mailOptions = {
    from: process.env.OUR_EMAIL,
    to: userEmail,
    subject: "Your video is ready! 😻", // Unesite subjekat e-pošte
    text: "Your truecontento is ready for download! 👇 Don't hesitate to share it now. 🚀", // Unesite tekst e-pošte
    attachments: [
      {
        filename: videoName + ".mp4",
        path: manipulator.getFilePath(dirName, "videoWSub.mp4"),
      },
    ],
  };

  // Slanje e-pošte
  try {
    let info = await transporter.sendMail(mailOptions);
    logger.logUserAction(userEmail, `email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.logUserAction(userEmail, `email NOT sent: ${error}`);
    logger.logError(error);
    return false;
  }
}

module.exports = { sendEmail };
