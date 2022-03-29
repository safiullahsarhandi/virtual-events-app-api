"use strict";

const multer = require("fastify-multer");
const { storage, fileFilter } = require("../../../../multer");

const upload = multer({ storage, fileFilter });
const images = upload.fields([
  { name: "cover_image", maxCount: 1 },
  { name: "media", maxCount: 1 },
]);

const {
  add,
  logs,
  changeStatus,
  storyDetails,
} = require("../../../../controllers/story");

module.exports = async function (fastify, opts) {
  // @USER ROUTES
  fastify.post(
    "/user/add",
    { preHandler: [images, fastify.authenticate] },
    add
  );

  // @ADMIN ROUTES
  fastify.get(
    "/admin/logs",
    { preHandler: [fastify.authenticate_admin] },
    logs
  );
  fastify.get(
    "/admin/status/:id",
    { preHandler: [fastify.authenticate_admin] },
    changeStatus
  );
  fastify.get(
    "/admin/story/:id",
    { preHandler: [fastify.authenticate_admin] },
    storyDetails
  );
};
