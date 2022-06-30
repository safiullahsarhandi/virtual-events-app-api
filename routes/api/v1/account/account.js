const { index } = require("../../../../controllers/account");



module.exports = async (fastify,opts)=> {
    fastify.get('/',{ preHandler: [fastify.authenticate] },index);
}