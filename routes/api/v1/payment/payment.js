"use strict";

const { logs } = require("../../../../controllers/payment");

module.exports = async function (fastify, opts) {
  //@ADMIN ROUTES
  fastify.get(
    "/admin/logs",
    { preHandler: [fastify.authenticate_admin] },
    logs
  );
};
