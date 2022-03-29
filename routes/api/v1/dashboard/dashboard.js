"use strict";

const { getDashboardStats } = require("../../../../controllers/dashboard");

module.exports = async function (fastify, opts) {
  // @ADMIN ROUTES
  fastify.get(
    "/admin/",
    { preHandler: [fastify.authenticate_admin] },
    getDashboardStats
  );
};
