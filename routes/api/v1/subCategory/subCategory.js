"use strict";

const {
  add,
  update,
  searchSubCategory,
} = require("../../../../controllers/subCategory");

module.exports = async function (fastify, opts) {
  //@ADMIN ROUTES
  fastify.post("/admin/add", { preHandler: [fastify.authenticate_admin] }, add);
  fastify.post(
    "/admin/edit",
    { preHandler: [fastify.authenticate_admin] },
    update
  );
  fastify.get(
    "/admin/search",
    { preHandler: [fastify.authenticate_admin] },
    searchSubCategory
  );
};
