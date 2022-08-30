const {Schema,model,Types} = require('mongoose');


const schema = new Schema({
    orderProductId : {
        type : Types.ObjectId,
        ref : 'OrderProduct',
        required : true,
    },
    attributeId : {
        type : Types.ObjectId,
        ref : 'Attribute',
        required : true,
    },
    valueId : {
        type : Types.ObjectId,
        ref : 'Attribute.attribute_values',
        required : true,
    }
    
},{
    timestamps : true,
});

module.exports = model('OrderProductAttribute',schema);