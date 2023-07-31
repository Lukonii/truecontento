const fetch = require("node-fetch");
const fs = require("fs");
require("dotenv").config();

const engineId = process.env.ELLAB_ENGINE_ID;
const apiHost = process.env.ELLAB_API_HOST;
const apiKey = process.env.ELLAB_API_KEY;

async function getImage(imageProps) {
  const response = await fetch(
    `${apiHost}/v1/generation/${engineId}/text-to-image`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: imageProps.prompt,
            weight: 1,
          },
          {
            text: "(out of frame), text, error, cropped, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, out of frame, (extra fingers), mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck, username, watermark, signature, kitsch, ugly, boring, bad anatomy, oversaturated, grain, low-res, deformed, blurry, duplicate, fog, darkness, grain",
            weight: -1,
          },
        ],
        style_preset: imageProps.style,
        cfg_scale: 7,
        clip_guidance_preset: "FAST_BLUE",
        height: imageProps.height,
        width: imageProps.width,
        samples: 1,
        steps: 30,
      }),
    }
  )
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Non-200 response: ${await response.text()}`);
      }
      console.log(response);
      const responseJSON = await response.json();
      console.log(responseJSON.artifacts);

      responseJSON.artifacts.forEach((image, index) => {
        fs.writeFileSync(
          `${imageProps.targetDir}/image${imageProps.imageIndex}.png`,
          Buffer.from(image.base64, "base64")
        );
      });

      console.log("Slika je uspešno sačuvana.");
    })
    .catch((error) => {
      console.error(error);
    });
  // .then((response) => {
  //   console.log(response);
  //   response.json();
  // })
  // .then((data) => {
  //   console.log(data);
  //   data.artifacts.forEach((image, index) => {
  //     fs.writeFileSync(
  //       `./slika_test_${index}.png`,
  //       Buffer.from(image.base64, "base64")
  //     );
  //   });
  // })
  // .catch((error) => {
  //   console.error(error.message);
  // });
}
module.exports = { getImage };
