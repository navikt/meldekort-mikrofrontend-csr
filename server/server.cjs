const path = require("path");
const express = require("express");
const cors = require("cors");
const expressStaticGzip = require("express-static-gzip");

const corsAllowedOrigin = process.env.CORS_ALLOWED_ORIGIN || "http://localhost:3000";
const basePath = "/meldekort-mikrofrontend";
const buildPath = path.resolve(__dirname, "../dist");
const port = 7800;

const server = express();

server.use(cors({ origin: corsAllowedOrigin }));

server.use(
  basePath,
  expressStaticGzip(buildPath, {
    enableBrotli: true,
    orderPreference: ["br"],
  })
);

server.get(`${basePath}/internal/isAlive`, (req, res) => {
  res.sendStatus(200);
});

server.get(`${basePath}/internal/isReady`, (req, res) => {
  res.sendStatus(200);
});

server.listen(port, () => console.log("Server listening on port " + port));
