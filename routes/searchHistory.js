const express = require("express");
const { cors } = require("../middleware/auth");
const { fetchNewSearches } = require("../utils/api");
const { redis } = require("../utils/redis");
const { sanitizeInput, verifyCaptcha } = require("../utils/validation");

const router = express.Router();

router.get("/", cors, async (req, res) => {
  const name = req.query.name;
  const captchaToken = req.query.captcha;

  const sanitizedName = sanitizeInput(name);
  if (!sanitizedName || sanitizedName.split(/\s+/).length < 1) {
    return res.status(400).json({ message: "Please provide a valid celebrity name." });
  }

  if (captchaToken && process.env.NODE_ENV !== "development") {
    if (!(await verifyCaptcha(captchaToken))) {
      return res.status(403).json({ message: "CAPTCHA verification failed." });
    }
  }

  const cacheKey = `searches:${sanitizedName}`;
  const ttl = 300; // 5 minutes

  try {
    let cachedSearches = await redis.get(cacheKey);

    if (!cachedSearches) {
      cachedSearches = await fetchNewSearches(sanitizedName);
      await redis.set(cacheKey, JSON.stringify(cachedSearches), "EX", ttl);
      res.json({ searches: cachedSearches });
      return;
    }

    const remainingTtl = await redis.ttl(cacheKey);

    if (remainingTtl < 0) { // Cache expired
      cachedSearches = await fetchNewSearches(sanitizedName);
      await redis.set(cacheKey, JSON.stringify(cachedSearches), "EX", ttl);
    } else {
      cachedSearches = JSON.parse(cachedSearches);
    }

    res.json({ searches: cachedSearches });
  } catch (error) {
    console.error("API Error:", error.message);
    if (error.response && error.response.status === 429) {
      return res.status(429).json({ message: "Too many requests—please try again later." });
    }
    res.status(500).json({ message: "Search database is down" });
  }
});

module.exports = router;