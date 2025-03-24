const express = require("express");
const { enforceOrigin } = require("./middleware/auth");
const searchHistoryRouter = require("./routes/searchHistory");

const app = express();

app.use(enforceOrigin);
app.use("/api/search-history", searchHistoryRouter);

module.exports = app;