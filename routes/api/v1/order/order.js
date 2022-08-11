"use strict";

const {
  createOrder,
  logs,
  orderDetails,
  changeOrderStatus,
  placeOrder
} = require("../../../../controllers/order");

module.exports = async function (fastify, opts) {
  //@USER ROUTES
  fastify.post(
    "/user/create",
    { preHandler: [fastify.authenticate] },
    createOrder
  );

  fastify.post(
    "/user/place-order",
    { preHandler: [fastify.authenticate] },
    placeOrder
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
