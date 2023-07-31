const { Configuration, OpenAIApi } = require("openai");

async function getKeywords(data) {
  try {
    console.log("Getting keywords...");
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    const completionKeyword = await openai.createCompletion({
      model: "text-davinci-003",
      prompt:
        "Example: " +
        data +
        `User: Give me 5 keywords for example.
        ChatGPT:`,
      temperature: 0.7, // treba povecati tremraturu kada se regenerise tekst zbog audia.
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    console.log("Getting keywords... finished");
    let keywords = { result: completionKeyword.data.choices[0].text };
    return keywords;
  } catch (error) {
    if (error.response) {
      console.log("Error getting keywords.");
      throw error.response;
    } else {
      console.error(`Error with OpenAI API request keywords: ${error.message}`);
      throw error;
    }
  }
}

module.exports = { getKeywords };
