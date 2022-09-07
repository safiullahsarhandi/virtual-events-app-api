"use strict";

const { hostEvent, logs, get,sendInvite,getMyEvents,getEvent, updateEvent,getInvites,updateRoom,deleteInvitee, checkInvitee, changeInviteStatus, getAttendees, endEvent } = require("../../../../controllers/event");

const multer = require("fastify-multer");
const { storage, fileFilter } = require("../../../../multer");

const upload = multer({ storage, fileFilter });
const images = upload.fields([{ name: "file", maxCount: 1 }]);

module.exports = async function (fastify, opts) {
  // @USER ROUTES
  fastify.post("/user/host", { preHandler: [fastify.authenticate] }, hostEvent);
  fastify.post("/user/:id/update-room", { preHandler: [fastify.authenticate] }, updateRoom);
  
  fastify.post("/:id/invite", { preHandler: [fastify.authenticate] }, sendInvite);
  fastify.delete("/:id/invitee", { preHandler: [fastify.authenticate] }, deleteInvitee);
  fastify.post("/:id/check-invitee", { preHandler: [fastify.authenticate] }, checkInvitee);
  fastify.post("/:id/change-invite-status", { preHandler: [fastify.authenticate] }, changeInviteStatus);
  fastify.post("/:id/end", { preHandler: [fastify.authenticate] }, endEvent);
  // end
  fastify.post("/:id", { preHandler: [fastify.authenticate,images] }, updateEvent);
  // 
  fastify.get("/my", { preHandler: [fastify.authenticate] }, getMyEvents);
  fastify.get("/:id", { preHandler: [fastify.authenticate] }, getEvent);
  fastify.get("/:id/invites", { preHandler: [fastify.authenticate] }, getInvites);
  fastify.get("/:id/attendees", { preHandler: [fastify.authenticate] }, getAttendees);
  
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
