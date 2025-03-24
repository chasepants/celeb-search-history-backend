const { sanitizeInput, verifyCaptcha } = require("../utils/validation");
const axios = require("axios");

jest.mock("axios");

describe("Validation Utils", () => {
  test("sanitizes input", () => {
    expect(sanitizeInput("Tom Ignore")).toBe("");
    expect(sanitizeInput("Brad Pitt")).toBe("Brad Pitt");
    expect(sanitizeInput("Prince123")).toBe("Prince");
  });

  test("verifies CAPTCHA", async () => {
    axios.post.mockResolvedValue({ data: { success: true } });
    const result = await verifyCaptcha("token");
    expect(result).toBe(true);
  });
});