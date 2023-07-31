const fs = require("fs");
const path = require("path");

async function getGenerateTemplate(req, res) {
  fs.readFile(path.join(__dirname, "generate-video.html"), (err, data) => {
    if (err) {
      return res.status(500).send({ err: "Can not read generator file" });
    } else {
      return res.status(200).send(data);
    }
  });
}

module.exports = { getGenerateTemplate };
