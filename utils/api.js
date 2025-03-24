const axios = require("axios");
const { prompt } = require("./chatbot-helper");
require("dotenv").config();

const fetchNewSearches = async (name) => {
  try {
    const response = await axios.post(
      "https://api.x.ai/v1/chat/completions",
      {
        model: "grok-2-latest",
        messages: [
          {
            role: "user",
            content: prompt(name)
          }
        ],
        max_tokens: 150
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROK_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const grokResponse = response.data.choices[0].message.content.trim();
    return grokResponse.split("\n").filter((line) => line.trim()).map(search => ({
      title: search.replace(/^\d+\.\s*/, "").trim(),
      timestamp: new Date().toLocaleString(),
      device: ["Desktop", "Mobile", "Tablet"][Math.floor(Math.random() * 3)],
      browser: ["Chrome", "Safari", "Firefox"][Math.floor(Math.random() * 3)],
      ip: "Location hidden"
    }));
  } catch (error) {
    console.error("Grok API Error:", error.message);
    throw error;
  }
};

module.exports = { fetchNewSearches };