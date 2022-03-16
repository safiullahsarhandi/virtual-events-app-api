("use strict");

const fp = require("fastify-plugin");
const jwt_user = require("fastify-jwt");

module.exports = fp(async function (fastify) {
  fastify.register(jwt_user, {
    secret: process.env.JWT_SECRET,
  });

  fastify.decorate("authenticate", async function (request, reply) {
    try {
      const result = await request.jwtVerify();
      if (!result.scope.is_user)
        reply.code(401).send({
          message: "Unauthenticated",
        });
    } catch (err) {
      reply.code(401).send({
        message: "Unauthenticated",
      });
    }
  });

  fastify.decorate("authenticate_admin", async function (request, reply) {
    try {
      const result = await request.jwtVerify();
      if (!result.scope.is_admin)
        reply.code(401).send({
          message: "Unauthenticated",
        });
    } catch (err) {
      reply.code(401).send({
        message: "Unauthenticated",
      });
    }
  });
});
