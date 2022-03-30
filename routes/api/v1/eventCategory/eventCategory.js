"use strict";

const {
  add,
  update,
  logs,
  changeStatus,
  get,
} = require("../../../../controllers/eventCategory");

module.exports = async function (fastify, opts) {
  //@ADMIN ROUTES
  fastify.post("/admin/add", { preHandler: [fastify.authenticate_admin] }, add);
  fastify.post(
    "/admin/edit",
    { preHandler: [fastify.authenticate_admin] },
    update
  );
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
    "/admin/get/:id",
    { preHandler: [fastify.authenticate_admin] },
    get
  );
};
