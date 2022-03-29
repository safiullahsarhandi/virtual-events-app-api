"use strict";

const {
  addFeedback,
  logs,
  getFeedbackDetails,
} = require("../../../../controllers/feedback");

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
    getFeedbackDetails
  );

  //@USER ROUTES
  fastify.post("/user/create", addFeedback);
};
