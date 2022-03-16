"use strict";

const multer = require("fastify-multer");
const { storage, fileFilter } = require("../../../../multer");

const upload = multer({ storage, fileFilter });
const images = upload.fields([{ name: "user_image", maxCount: 1 }]);

const {
  me,
  editProfile,
  updatePassword,
} = require("../../../../controllers/admin");

module.exports = async function (fastify, opts) {
  // @ADMIN ROUTES
  fastify.get("/", { preHandler: [fastify.authenticate_admin] }, me);
  fastify.post(
    "/",
    { preHandler: [images, fastify.authenticate_admin] },
    editProfile
  );
  fastify.post(
    "/password",
    { preHandler: [fastify.authenticate_admin] },
    updatePassword
  );
};
