const { store,update,index,show } = require("../../../../controllers/List");
const createListRequest = require("../../../../validations/createListRequest");
module.exports =  async (fastify,opts)=> {
    fastify.get('/',{preHandler : [fastify.authenticate]},index);
    fastify.get('/:id',{preHandler : [fastify.authenticate]},show);
    
    fastify.post('/',{preHandler : [fastify.authenticate,createListRequest]},store);
    fastify.post('/:id',{preHandler : [fastify.authenticate,createListRequest]},update);
}