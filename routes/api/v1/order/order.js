"use strict";

const {
  createOrder,
  logs,
  orderDetails,
  changeOrderStatus,
} = require("../../../../controllers/order");

module.exports = async function (fastify, opts) {
  //@USER ROUTES
  fastify.post(
    "/user/create",
    { preHandler: [fastify.authenticate] },
    createOrder
  );

  //@ADMIN ROUTES
  fastify.get(
    "/admin/logs",
    { preHandler: [fastify.authenticate_admin] },
    logs
  );
  fastify.get(
    "/admin/view/:id",
    { preHandler: [fastify.authenticate_admin] },
    orderDetails
  );
  fastify.post(
    "/admin/change-status",
    { preHandler: [fastify.authenticate_admin] },
    changeOrderStatus
  );
};
