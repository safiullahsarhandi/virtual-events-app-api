"use strict";

const multer = require("fastify-multer");
const { storage, fileFilter } = require("../../../../multer");

const upload = multer({ storage, fileFilter });
const images = upload.fields([{ name: "product_image", maxCount: 10 }]);

const {
  addProduct,
  changeStatus,
  getProductDetails,
  logs,
  updateProduct,
} = require("../../../../controllers/product");

module.exports = async function (fastify, opts) {
  //@ADMIN ROUTES
  fastify.post(
    "/admin/add",
    { preHandler: [images, fastify.authenticate_admin] },
    addProduct
  );
  fastify.post(
    "/admin/edit",
    { preHandler: [images, fastify.authenticate_admin] },
    updateProduct
  );
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

  // @GENERAL
  fastify.get("/details/:id", getProductDetails);
};
