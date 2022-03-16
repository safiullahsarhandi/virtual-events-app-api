"use strict";

const {
  getNotificationCount,
  getNotificationAdmin,
  readNotification,
} = require("../../../../controllers/notification");

module.exports = async function (fastify, opts) {
  // @ADMIN ROUTES
  fastify.get(
    "/admin/get",
    { preHandler: [fastify.authenticate_admin] },
    getNotificationAdmin
  );
  fastify.get(
    "/admin/count",
    { preHandler: [fastify.authenticate_admin] },
    getNotificationCount
  );
  fastify.get(
    "/admin/read/:id",
    { preHandler: [fastify.authenticate_admin] },
    readNotification
  );
};
