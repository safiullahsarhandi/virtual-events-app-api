"use strict";

const {
  addAttribute,
  editAttribute,
  getAttribute,
  logs,
  changeStatus,
  getAttributesMin,
} = require("../../../../controllers/attribute");

module.exports = async function (fastify, opts) {
  //@ADMIN ROUTES
  fastify.post(
    "/admin/create",
    { preHandler: [fastify.authenticate_admin] },
    addAttribute
  );
  fastify.post(
    "/admin/edit",
    { preHandler: [fastify.authenticate_admin] },
    editAttribute
  );
  fastify.get(
    "/admin/logs",
    { preHandler: [fastify.authenticate_admin] },
    logs
  );
  fastify.get(
    "/admin/details/:id",
    { preHandler: [fastify.authenticate_admin] },
    getAttribute
  );
  fastify.get(
    "/admin/status/:id",
    { preHandler: [fastify.authenticate_admin] },
    changeStatus
  );
  fastify.get(
    "/admin/min",
    { preHandler: [fastify.authenticate_admin] },
    getAttributesMin
  );
};
