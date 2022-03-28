"use strict";

const { createOrder } = require("../../../../controllers/order");

module.exports = async function (fastify, opts) {
  //@USER ROUTES
  fastify.post(
    "/user/create",
    { preHandler: [fastify.authenticate] },
    createOrder
  );
};
