import * as cors from "cors";
import * as express from "express";
import expressStaticGzip from "express-static-gzip";
import * as path from "path";

const corsAllowedOrigin = process.env.CORS_ALLOWED_ORIGIN || "http://localhost:3000";
const basePath = "/meldekort-mikrofrontend";
const __dirname = import.meta.dirname;
const buildPath = path.resolve(__dirname, "../dist");
const port = 7800;

const server = express();

server.use(cors({ origin: corsAllowedOrigin }));

server.use(
  basePath,
  expressStaticGzip(buildPath, {
    enableBrotli: true,
    orderPreference: ["br"],
  }),
);

server.get(`${basePath}/internal/isAlive`, (req, res) => {
  res.sendStatus(200);
});

server.get(`${basePath}/internal/isReady`, (req, res) => {
  res.sendStatus(200);
});

server.listen(port, () => console.log("Server listening on port " + port));
