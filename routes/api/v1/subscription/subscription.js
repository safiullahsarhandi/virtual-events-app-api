"use strict";

const { subscribe, logs,getPlans,getPlan } = require("../../../../controllers/subscription");

module.exports = async function (fastify, opts) {
  // @USER ROUTES
  fastify.post(
    "/user/subscribe",
    { preHandler: [fastify.authenticate] },
    subscribe
  );

  //@ADMIN ROUTES
  fastify.get(
    "/admin/logs",
    { preHandler: [fastify.authenticate_admin] },
    logs
  );

  fastify.get(
    "/all",
    { preHandler: [fastify.authenticate] },
    getPlans
  );
  fastify.get(
    "/:id",
    { preHandler: [fastify.authenticate] },
    getPlan
  );
};
