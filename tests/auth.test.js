const { enforceOrigin, cors } = require("../middleware/auth");

describe("Auth Middleware", () => {
  test("enforces origin in prod", () => {
    process.env.NODE_ENV = "production";
    const req = { headers: { origin: "http://wrong.com" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    enforceOrigin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Access denied: Invalid or missing origin." });
  });

  test("allows any origin in dev", () => {
    process.env.NODE_ENV = "development";
    const req = { headers: { origin: "http://localhost:3000" } };
    const res = {};
    const next = jest.fn();
    enforceOrigin(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});