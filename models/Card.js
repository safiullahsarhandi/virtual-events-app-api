const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const cardSchema = new Schema({
    userId : {
        type : Schema.Types.ObjectId,
        required : true,
        ref : 'User',
    },
    cardId : {
        type : String,
        required : true,
    },
    cardBrand : {
        type : String,
        default : null,
    },
    cardHolder : {
        type : String,
        required : true,
    },
    last4 : {
        type : String,
    },
    expiry : {
        type : String,
        required : true,
    },
    status : {
        type : Boolean,
        default : true,
    }
},{
    timestamps : true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});



const Card = mongoose.model('Card',cardSchema);
module.exports =  Card;