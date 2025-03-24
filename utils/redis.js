const Redis = require("ioredis");
require("dotenv").config();

const redis = new Redis(process.env.REDIS_URL, {
  tls: { rejectUnauthorized: false },
  retryStrategy: (times) => Math.min(times * 50, 2000),
  maxRetriesPerRequest: 5
});

module.exports = { redis };