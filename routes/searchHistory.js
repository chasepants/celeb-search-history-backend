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
  const rateLimitKey = "search:rate_limit";
  const ttl = 300;

  try {
    const searchCount = parseInt(await redis.get(rateLimitKey) || "0", 10);
    let cachedSearches = await redis.get(cacheKey);

    if (!cachedSearches || searchCount < 5) {
      const newSearches = await fetchNewSearches(sanitizedName);

      if (!cachedSearches) {
        const fullSearches = Array(5).fill().map(() => fetchNewSearches(sanitizedName));
        const results = await Promise.all(fullSearches);
        cachedSearches = results.flat().slice(0, 25);
      } else {
        cachedSearches = JSON.parse(cachedSearches || "[]"); // Ensure array if null
        cachedSearches = cachedSearches.slice(5);
        cachedSearches.unshift(...newSearches);
      }

      await redis.set(cacheKey, JSON.stringify(cachedSearches), "EX", ttl);
      await redis.incr(rateLimitKey);
      await redis.expire(rateLimitKey, ttl);

      return res.json({ searches: cachedSearches });
    }

    cachedSearches = JSON.parse(cachedSearches || "[]"); // Ensure array
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