const {Schema,model,Types} = require('mongoose');


const orderProductSchema = new Schema({
    orderId : {
        type : Types.ObjectId,
        ref : 'Order',
        required : true,
    },
    productId : {
        type : Types.ObjectId,
        ref : 'Product',
        required : true,
    },
    price : {
        type : Number,
        required : true,
    },
    qty : {
        type : Number,
        required : true,
    },
    
},{
    timestamps : true,
});

module.exports = model('OrderProduct',orderProductSchema);