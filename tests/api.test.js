const { fetchNewSearches } = require("../utils/api");
const axios = require("axios");

jest.mock("axios");

describe("API Utils", () => {
  test("fetches new searches", async () => {
    axios.post.mockResolvedValue({
      data: { choices: [{ message: { content: "1. Test Search" } }] }
    });
    const searches = await fetchNewSearches("Brad Pitt");
    expect(searches).toEqual([{ title: "Test Search", timestamp: expect.any(String), device: expect.any(String), browser: expect.any(String), ip: "Location hidden" }]);
  });

  test("handles API error", async () => {
    axios.post.mockRejectedValue(new Error("API Error"));
    await expect(fetchNewSearches("Brad Pitt")).rejects.toThrow("API Error");
  });
});