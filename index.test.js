const request = require("supertest");
const app = require("./index");
const { fetchNewSearches } = require("./utils/api");
const { redis } = require("./utils/redis");
const { sanitizeInput, verifyCaptcha } = require("./utils/validation");

jest.mock("./utils/api");
jest.mock("./utils/redis");
jest.mock("./utils/validation");

describe("GET /api/search-history", () => {
  beforeEach(() => {
    fetchNewSearches.mockReset();
    redis.get.mockReset();
    redis.set.mockReset();
    redis.incr.mockReset();
    redis.expire.mockReset();
    redis.ttl.mockReset();
    sanitizeInput.mockReset();
    verifyCaptcha.mockReset();

    // Default mocks
    sanitizeInput.mockImplementation(input => input);
    verifyCaptcha.mockResolvedValue(true);
    fetchNewSearches.mockResolvedValue(
      Array(5).fill().map((_, i) => ({
        title: `Mock Search ${i}`,
        timestamp: "2025-03-22",
        device: "Desktop",
        browser: "Chrome",
        ip: "Location hidden"
      }))
    );
    redis.get.mockImplementation(key => null);
    redis.set.mockResolvedValue("OK");
    redis.ttl.mockResolvedValue(150); // Fresh cache by default
  });

  it("should return 5 searches for a valid celebrity name", async () => {
    const res = await request(app)
      .get("/api/search-history?name=Tom%20Cruise")
      .set("Origin", "https://celeb-search-history-frontend.vercel.app");
    expect(res.status).toBe(200);
    expect(res.body.searches).toHaveLength(5); // Adjusted to 5
    expect(res.body.searches[0].title).toBeDefined();
  }, 10000);

  it("should return error for invalid input", async () => {
    sanitizeInput.mockReturnValue("");
    const res = await request(app)
      .get("/api/search-history?name=123")
      .set("Origin", "https://celeb-search-history-frontend.vercel.app");
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Please provide a valid celebrity name.");
  }, 10000);

  it("should handle API failure", async () => {
    fetchNewSearches.mockRejectedValue(new Error("API Failure"));
    const res = await request(app)
      .get("/api/search-history?name=Tom%20Cruise")
      .set("Origin", "https://celeb-search-history-frontend.vercel.app");
    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Search database is down");
  }, 10000);

  it("should return 404 for /api/test (no route)", async () => {
    const res = await request(app)
      .get("/api/test")
      .set("Origin", "https://celeb-search-history-frontend.vercel.app");
    expect(res.status).toBe(404);
  }, 10000);
});