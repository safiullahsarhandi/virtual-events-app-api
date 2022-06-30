"use strict";

const multer = require("fastify-multer");
const { storage, fileFilter } = require("../../../../multer");

const upload = multer({ storage, fileFilter });
const images = upload.fields([{ name: "user_image", maxCount: 0 }]);

const {
  registerAdmin,
  loginAdmin,
  recoverPassword,
  verifyRecoverCode,
  resetPassword,
  registerUser,
  loginUser,
} = require("../../../../controllers/auth");

module.exports = async function (fastify, opts) {
  //@ADMIN ROUTES
  fastify.post("/admin/register", { preHandler: [images] }, registerAdmin);
  fastify.post("/admin/login", loginAdmin);

  //@USER ROUTES
  fastify.post("/user/register", { preHandler: [images] }, registerUser);
  fastify.post("/user/login", loginUser);

  // @GENERAL ROUTES
  fastify.post("/recover", recoverPassword);
  fastify.post("/verify", verifyRecoverCode);
  fastify.post("/reset", resetPassword);
};
