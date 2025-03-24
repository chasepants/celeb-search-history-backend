const axios = require("axios");
require("dotenv").config();

const sanitizeInput = (input) => {
  const injectionPatterns = [
    /ignore/i,
    /prompt/i,
    /hijack/i,
    /session/i,
    /system/i,
    /override/i,
    /execute/i
  ];
  const hasInjection = injectionPatterns.some(pattern => pattern.test(input));
  return hasInjection ? "" : input.replace(/[^a-zA-Z\s]/g, "").trim();
};

const verifyCaptcha = async (token) => {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  const response = await axios.post(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    `secret=${secretKey}&response=${token}`,
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  return response.data.success;
};

module.exports = { sanitizeInput, verifyCaptcha };