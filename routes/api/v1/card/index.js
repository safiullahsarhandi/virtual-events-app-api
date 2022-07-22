const {index, createCard,destroy } = require("../../../../controllers/card");

module.exports = async function (fastify, opts) {

    fastify.get('/',{preHandler : fastify.authenticate,},index);
    fastify.delete('/:id',{preHandler : fastify.authenticate,},destroy);
    fastify.post('/create',{preHandler : fastify.authenticate,},createCard);
}