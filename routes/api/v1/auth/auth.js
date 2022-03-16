"use strict";

const multer = require("fastify-multer");
const { storage, fileFilter } = require("../../../../multer");

const upload = multer({ storage, fileFilter });
const images = upload.fields([{ name: "user_image", maxCount: 1 }]);

const {
  registerAdmin,
  loginAdmin,
  recoverPassword,
  verifyRecoverCode,
  resetPassword,
} = require("../../../../controllers/auth");

module.exports = async function (fastify, opts) {
  //@ADMIN ROUTES
  fastify.post("/admin/register", { preHandler: [images] }, registerAdmin);
  fastify.post("/admin/login", loginAdmin);

  // @GENERAL ROUTES
  fastify.post("/recover", recoverPassword);
  fastify.post("/verify", verifyRecoverCode);
  fastify.post("/reset", resetPassword);
};
