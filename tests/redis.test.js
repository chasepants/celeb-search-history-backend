const Redis = require("ioredis");
const { redis } = require("../utils/redis");

jest.mock("ioredis", () => {
  return jest.fn().mockImplementation(() => ({
    options: { retryStrategy: jest.fn() }
  }));
});

describe("Redis Utils", () => {
  test("redis client is initialized", () => {
    expect(redis).toBeDefined();
    expect(redis.options.retryStrategy).toBeDefined();
  });
});