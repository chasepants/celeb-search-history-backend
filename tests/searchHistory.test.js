const request = require("supertest");
const express = require("express");
const searchHistoryRouter = require("../routes/searchHistory");
const { redis } = require("../utils/redis");
const { fetchNewSearches } = require("../utils/api");
const { sanitizeInput, verifyCaptcha } = require("../utils/validation");

// Mock ioredis globally
jest.mock("../utils/redis", () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn()
  }
}));
jest.mock("../utils/api");
jest.mock("../utils/validation");

const app = express();
app.use("/api/search-history", searchHistoryRouter);

describe("GET /api/search-history", () => {
  beforeEach(() => {
    redis.get.mockReset();
    redis.set.mockReset();
    redis.incr.mockReset();
    redis.expire.mockReset();
    fetchNewSearches.mockReset();
    sanitizeInput.mockImplementation(input => input);
    verifyCaptcha.mockResolvedValue(true);
  });

  test("rejects invalid name", async () => {
    sanitizeInput.mockReturnValue("");
    const response = await request(app).get("/api/search-history?name=Tom%20Ignore");
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Please provide a valid celebrity name.");
  });

  test("returns cached searches", async () => {
    const cachedData = [{ title: "Cached Search", timestamp: "2025-03-22", device: "Desktop", browser: "Chrome", ip: "Location hidden" }];
    redis.get.mockResolvedValueOnce(JSON.stringify(cachedData));
    redis.get.mockResolvedValueOnce("2");
    const response = await request(app).get("/api/search-history?name=Brad%20Pitt");
    expect(response.status).toBe(200);
    expect(response.body.searches).toEqual(cachedData);
  });

  test("fetches new searches when cache empty", async () => {
    const newSearches = [{ title: "New Search", timestamp: "2025-03-22", device: "Desktop", browser: "Chrome", ip: "Location hidden" }];
    redis.get.mockResolvedValueOnce(null);
    redis.get.mockResolvedValueOnce("0");
    fetchNewSearches.mockResolvedValue(newSearches);
    const response = await request(app).get("/api/search-history?name=Brad%20Pitt");
    expect(response.status).toBe(200);
    expect(response.body.searches.length).toBe(25);
    expect(response.body.searches[0].title).toBe("New Search");
    expect(redis.set).toHaveBeenCalled();
  });
});