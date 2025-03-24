const request = require("supertest");
const express = require("express");
const searchHistoryRouter = require("../routes/searchHistory");
const { redis } = require("../utils/redis");
const { fetchNewSearches } = require("../utils/api");
const { sanitizeInput, verifyCaptcha } = require("../utils/validation");

jest.mock("../utils/redis");
jest.mock("../utils/api");
jest.mock("../utils/validation");

const app = express();
app.use("/api/search-history", searchHistoryRouter);

describe("GET /api/search-history", () => {
  beforeEach(() => {
    redis.get.mockReset();
    redis.set.mockReset();
    redis.ttl.mockReset();
    fetchNewSearches.mockReset();
    sanitizeInput.mockReset();
    verifyCaptcha.mockReset();

    // Default mocks
    sanitizeInput.mockImplementation(input => input);
    verifyCaptcha.mockResolvedValue(true);
    fetchNewSearches.mockResolvedValue(
      Array(5).fill().map((_, i) => ({
        title: `New Search ${i}`,
        timestamp: "2025-03-22",
        device: "Desktop",
        browser: "Chrome",
        ip: "Location hidden"
      }))
    );
  });

  test("rejects invalid name", async () => {
    sanitizeInput.mockReturnValue("");
    const response = await request(app).get("/api/search-history?name=Tom%20Ignore");
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Please provide a valid celebrity name.");
  });

  test("returns cached searches when fresh", async () => {
    const cachedData = [{ title: "Cached Search", timestamp: "2025-03-22", device: "Desktop", browser: "Chrome", ip: "Location hidden" }];
    redis.get.mockResolvedValueOnce(JSON.stringify(cachedData));
    redis.ttl.mockResolvedValueOnce(150); // TTL > 0, cache fresh
    const response = await request(app).get("/api/search-history?name=Brad%20Pitt");
    expect(response.status).toBe(200);
    expect(response.body.searches).toEqual(cachedData);
  });

  test("fetches new searches when cache empty", async () => {
    redis.get.mockResolvedValueOnce(null);
    const response = await request(app).get("/api/search-history?name=Brad%20Pitt");
    expect(response.status).toBe(200);
    expect(response.body.searches.length).toBe(5); // Single fetchNewSearches call
    expect(response.body.searches[0].title).toMatch(/New Search/);
    expect(redis.set).toHaveBeenCalled();
  });
});