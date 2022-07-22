const {Schema,model, Types} = require('mongoose');

const listSchema = new Schema({
    userId : {
        type : Types.ObjectId,
        required : true,
        ref : 'User',
    },
    title : {
        type : String,
        required : true,
    },
    emails : {
        type : Array,
        required : true,
        default : [],
    },
    
},{
    timestamps : true,
});



module.exports = model('List',listSchema);
