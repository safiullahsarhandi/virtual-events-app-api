"use strict";

const { runScript } = require("../../../../Scripts");

module.exports = async function (fastify, opts) {
  // @USER ROUTES
  fastify.get("/", runScript);
};
