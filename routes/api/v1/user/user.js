"use strict";

const {
  logs,
  changeStatus,
  userDetails,
} = require("../../../../controllers/user");

module.exports = async function (fastify, opts) {
  //@ADMIN ROUTES
  fastify.get(
    "/admin/logs",
    { preHandler: [fastify.authenticate_admin] },
    logs
  );
  fastify.get(
    "/admin/status/:id",
    { preHandler: [fastify.authenticate_admin] },
    changeStatus
  );
  fastify.get(
    "/admin/details/:id",
    { preHandler: [fastify.authenticate_admin] },
    userDetails
  );
};
