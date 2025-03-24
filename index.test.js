const request = require("supertest");
const app = require("./index");

jest.mock("./utils/redis", () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn()
  }
}));
jest.mock("./utils/api", () => ({
  fetchNewSearches: jest.fn().mockResolvedValue([{ title: "Mock Search", timestamp: "2025-03-22", device: "Desktop", browser: "Chrome", ip: "Location hidden" }])
}));
jest.mock("./utils/validation", () => ({
  sanitizeInput: jest.fn(input => input),
  verifyCaptcha: jest.fn().mockResolvedValue(true)
}));

describe("GET /api/search-history", () => {
  beforeEach(() => {
    require("./utils/redis").redis.get.mockReset();
    require("./utils/redis").redis.set.mockReset();
    require("./utils/redis").redis.incr.mockReset();
    require("./utils/redis").redis.expire.mockReset();
    require("./utils/api").fetchNewSearches.mockReset();
    require("./utils/validation").sanitizeInput.mockReset();
    require("./utils/validation").verifyCaptcha.mockReset();
  });

  it("should return 25 searches for a valid celebrity name", async () => {
    const res = await request(app)
      .get("/api/search-history?name=Tom%20Cruise")
      .set("Origin", "https://celeb-search-history-frontend.vercel.app");
    expect(res.status).toBe(200);
    expect(res.body.searches).toHaveLength(25);
    expect(res.body.searches[0].title).toBeDefined();
  }, 10000); // Increase timeout

  it("should return D-lister message for unknown name", async () => {
    require("./utils/api").fetchNewSearches.mockResolvedValue([{ title: "idk who that is, are they a d lister?" }]);
    const res = await request(app)
      .get("/api/search-history?name=John%20Doe")
      .set("Origin", "https://celeb-search-history-frontend.vercel.app");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("idk who that is, are they a d lister?");
  }, 10000);

  it("should return error for invalid input", async () => {
    require("./utils/validation").sanitizeInput.mockReturnValue("");
    const res = await request(app)
      .get("/api/search-history?name=123")
      .set("Origin", "https://celeb-search-history-frontend.vercel.app");
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Please provide a valid celebrity name.");
  }, 10000);

  it("should handle API failure", async () => {
    require("./utils/api").fetchNewSearches.mockRejectedValue(new Error("API Failure"));
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