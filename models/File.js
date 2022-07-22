const {Schema,model,Types} = require('mongoose');

const fileSchema = new Schema({
    userId : {
        type : Types.ObjectId,
        required : true,
    },
    name : {
        type : String,
        default : null,
    },
    path : {
        type : String,
        default : null,
    },
    size : {
        type : Number,
        default : 0,
    },
    mime : {
        type : String,
        default : null,
    },
    fileableId : {
        type : String,
        default : null,
    },
    fileableType : {
        type : String,
        default : null,
    },
},{
    timestamps : true,
});


module.exports = model('File',fileSchema);