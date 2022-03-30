"use strict";

const { hostEvent, logs, get } = require("../../../../controllers/event");

module.exports = async function (fastify, opts) {
  // @USER ROUTES
  fastify.post("/user/host", { preHandler: [fastify.authenticate] }, hostEvent);

  // @ADMIN ROUTES
  fastify.get(
    "/admin/logs",
    { preHandler: [fastify.authenticate_admin] },
    logs
  );
  fastify.get(
    "/admin/get/:id",
    { preHandler: [fastify.authenticate_admin] },
    get
  );
};
