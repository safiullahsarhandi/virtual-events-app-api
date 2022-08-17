"use strict";

const multer = require("fastify-multer");
const { storage, fileFilter } = require("../../../../multer");

const upload = multer({ storage, fileFilter });
const images = upload.any([{ name: "images", maxCount: 10 }]);

const {
  addProduct,
  changeStatus,
  getProductDetails,
  logs,
  updateProduct,
  getProducts,
  updateWishlist,
  getReviews,
  getWishlists,
  truncateWishlist,
  getUserReviews,
} = require("../../../../controllers/product");

module.exports = async function (fastify, opts) {
  // @USER ROUTES
  fastify.get('/user/reviews',{preHandler : [fastify.authenticate]},getUserReviews);
  fastify.get('/:id/reviews',{preHandler : [fastify.authenticate]},getReviews);
  fastify.get('/all',{preHandler : [fastify.authenticate]},getProducts);
  
  fastify.post('/wishlist/:id',{preHandler : [fastify.authenticate]},updateWishlist);
  fastify.get('/wishlists',{preHandler : [fastify.authenticate]},getWishlists);
  fastify.delete('/wishlists',{preHandler : [fastify.authenticate]},truncateWishlist);

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
