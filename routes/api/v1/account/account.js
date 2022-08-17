const { index,update,mySubscriptions, updatePassword } = require("../../../../controllers/account");
const updateAccountRequest = require("../../../../validations/updateAccountRequest");


const multer = require("fastify-multer");
const { storage, fileFilter } = require("../../../../multer");
const updatePasswordRequest = require("../../../../validations/updatePasswordRequest");

const upload = multer({ storage, fileFilter });
const image = upload.fields([{ name: "user_image", maxCount: 1 }]);


module.exports = async (fastify,opts)=> {
    fastify.get('/',{ preHandler: [fastify.authenticate] },index);
    fastify.post('/',{ preHandler: [fastify.authenticate,image,updateAccountRequest] },update);
    fastify.get('/my-subscription',{ preHandler: [fastify.authenticate] },mySubscriptions);
    fastify.post('/update-password',{ preHandler: [fastify.authenticate,updatePasswordRequest] },updatePassword);
    
}