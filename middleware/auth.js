const cors = require("cors");

const ALLOWED_ORIGIN = "https://celeb-search-history-frontend.vercel.app";

const enforceOrigin = (req, res, next) => {
  const origin = req.headers.origin;
  if (process.env.NODE_ENV === "development" || (origin && origin === ALLOWED_ORIGIN)) {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Invalid or missing origin." });
  }
};

const corsOptions = {
  origin: process.env.NODE_ENV === "development" ? "*" : ALLOWED_ORIGIN
};

module.exports = { enforceOrigin, cors: cors(corsOptions) };