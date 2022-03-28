"use strict";

const {
  createReview,
  getMyProductReview,
  editReview,
  deleteReview,
  reviewLogs,
  reviewDetails,
  getProductReviews,
} = require("../../../../controllers/review");

module.exports = async function (fastify, opts) {
  // @USER & VENDOR ROUTES
  fastify.post(
    "/user/create",
    { preHandler: [fastify.authenticate] },
    createReview
  );
  fastify.post(
    "/user/edit",
    { preHandler: [fastify.authenticate] },
    editReview
  );
  fastify.delete(
    "/user/delete/:id",
    { preHandler: [fastify.authenticate] },
    deleteReview
  );
  fastify.get(
    "/user/get/:id",
    { preHandler: [fastify.authenticate] },
    getMyProductReview
  );
  fastify.get(
    "/user/product/:id",
    { preHandler: [fastify.authenticate] },
    getProductReviews
  );

  // @ADMIN ROUTES
  fastify.get(
    "/admin/logs",
    { preHandler: [fastify.authenticate_admin] },
    reviewLogs
  );
  fastify.get(
    "/admin/product/:id",
    { preHandler: [fastify.authenticate_admin] },
    getProductReviews
  );
  fastify.get(
    "/admin/details/:id",
    { preHandler: [fastify.authenticate_admin] },
    reviewDetails
  );
  fastify.delete(
    "/admin/delete/:id",
    { preHandler: [fastify.authenticate_admin] },
    deleteReview
  );
};
