"use strict";

const { add, get, logs, edit, changeStatus } = require("../../../../controllers/package");

module.exports = async function (fastify, opts) {
  //@ADMIN ROUTES
  fastify.get(
    "/admin/logs",
    { preHandler: [fastify.authenticate_admin] },
    logs
  );
  fastify.get(
    "/admin/details/:id",
    { preHandler: [fastify.authenticate_admin] },
    get
  );
  fastify.post("/admin/add", { preHandler: [fastify.authenticate_admin] }, add);
  fastify.post(
    "/admin/edit",
    { preHandler: [fastify.authenticate_admin] },
    edit
  );
  fastify.get(
    "/admin/status/:id",
    { preHandler: [fastify.authenticate_admin] },
    changeStatus
  );
};
