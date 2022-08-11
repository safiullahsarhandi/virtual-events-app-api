"use strict";

const multer = require("fastify-multer");
const { storage, fileFilter } = require("../../../../multer");

const upload = multer({ storage, fileFilter });
const images = upload.fields([{ name: "category_image", maxCount: 1 }]);

const {
  addCategory,
  logs,
  changeStatus,
  get,
  updateCategory,
  searchCategory,
  allCategories,
  storyCategories,
  allSubCategories
} = require("../../../../controllers/category");

module.exports = async function (fastify, opts) {
  //@ADMIN ROUTES
  fastify.post(
    "/admin/add",
    { preHandler: [images, fastify.authenticate_admin] },
    addCategory
  );
  fastify.post(
    "/admin/edit",
    { preHandler: [images, fastify.authenticate_admin] },
    updateCategory
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
  fastify.get(
    "/admin/get/:id",
    { preHandler: [fastify.authenticate_admin] },
    get
  );
  fastify.get(
    "/admin/search",
    { preHandler: [fastify.authenticate_admin] },
    searchCategory
  );

  fastify.get('/user/all',{preHandler : [fastify.authenticate]},allCategories);
  fastify.get('/sub-categories/:id',{preHandler : [fastify.authenticate]},allSubCategories);
  fastify.get('/story',{preHandler : [fastify.authenticate]},storyCategories);
};
