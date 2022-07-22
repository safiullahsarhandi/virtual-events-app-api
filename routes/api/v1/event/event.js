"use strict";

const { hostEvent, logs, get,sendInvite,getMyEvents,getEvent, updateEvent } = require("../../../../controllers/event");

const multer = require("fastify-multer");
const { storage, fileFilter } = require("../../../../multer");

const upload = multer({ storage, fileFilter });
const images = upload.fields([{ name: "file", maxCount: 1 }]);

module.exports = async function (fastify, opts) {
  // @USER ROUTES
  fastify.post("/user/host", { preHandler: [fastify.authenticate] }, hostEvent);
  fastify.post("/:id/invite", { preHandler: [fastify.authenticate] }, sendInvite);
  fastify.post("/:id", { preHandler: [fastify.authenticate,images] }, updateEvent);
  // 
  fastify.get("/my", { preHandler: [fastify.authenticate] }, getMyEvents);
  fastify.get("/:id", { preHandler: [fastify.authenticate] }, getEvent);
  
  // @ADMIN ROUTES
  fastify.get(
    "/admin/logs",
    { preHandler: [fastify.authenticate_admin] },
    logs
  );
  fastify.get(
    "/admin/get/:id",
    { preHandler: [fastify.authenticate_admin] },
    get
  );
};
