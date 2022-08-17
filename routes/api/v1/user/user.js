"use strict";

const {
  logs,
  changeStatus,
  userDetails,
  getCountries,
  getStates,
  getCities,
  contactUs
} = require("../../../../controllers/user");
const contactUsRequest = require("../../../../validations/contactUsRequest");

module.exports = async function (fastify, opts) {
  fastify.get('/countries',{preHandler : [fastify.authenticate]},getCountries);
  fastify.get('/states/:countryId',{preHandler : [fastify.authenticate]},getStates);
  fastify.get('/cities/:stateId',{preHandler : [fastify.authenticate]},getCities);
  fastify.post('/contact',{preHandler : [contactUsRequest]},contactUs);
  
  //@ADMIN ROUTES
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
    "/admin/details/:id",
    { preHandler: [fastify.authenticate_admin] },
    userDetails
  );
};
