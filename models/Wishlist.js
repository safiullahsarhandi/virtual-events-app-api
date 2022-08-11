const {Schema,Types,model} = require('mongoose');

const wishListSchema = new Schema({
    productId : {
        type : Types.ObjectId,
        ref : 'Product',
    },
    userId : {
        type : Types.ObjectId,
        ref : 'User',
    },
},{
    timestamps : true,
});

module.exports = model('Wishlist',wishListSchema);