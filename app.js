"use strict";

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const AutoLoad = require("fastify-autoload");
const multer = require("fastify-multer");

// SSL Configuration
const local = true;
let credentials = {};

if (local) {
  credentials = {
    key: fs.readFileSync("/etc/apache2/ssl/onlinetestingserver.key", "utf8"),
    cert: fs.readFileSync("/etc/apache2/ssl/onlinetestingserver.crt", "utf8"),
    ca: fs.readFileSync("/etc/apache2/ssl/onlinetestingserver.ca"),
  };
} else {
  credentials = {
    key: fs.readFileSync("../certs/ssl.key"),
    cert: fs.readFileSync("../certs/ssl.crt"),
    ca: fs.readFileSync("../certs/ca-bundle"),
  };
}

const connectDB = require("./config/db");

const fastify = require("fastify")({
  logger: {
    prettyPrint: true,
  },
  // https: credentials,
});

fastify.register(AutoLoad, {
  dir: path.join(__dirname, "plugins"),
});

fastify.register(AutoLoad, {
  dir: path.join(__dirname, "routes"),
});

fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "uploads"),
  prefix: "/uploads",
});

fastify.addContentTypeParser("*", function (req, done) {
  done();
});

fastify.register(multer.contentParser);

fastify.listen(process.env.PORT, "0.0.0.0").then((res) => {
  connectDB();
});
