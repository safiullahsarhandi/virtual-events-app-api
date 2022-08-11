const {model,Schema, plugin, Types} = require('mongoose');

const stateSchema = new Schema({  
    id : Number,  
    name : String,
    country_id : {
        type : Types.ObjectId,
        ref : 'Country'
    },
    state_code : String,
    type : {
        type : String,
        default : null,
    },
    latitude : String,
    longitude : String,
});


module.exports = model('State',stateSchema);