const {model,Schema, plugin, Types} = require('mongoose');

const citySchema = new Schema({  
    name : String,
    state_id : {
        type : Types.ObjectId,
        ref : 'State'
    },
    country_id : {
        type : Types.ObjectId,
        ref : 'Country'
    },
    latitude : String,
    longitude : String,
    wikiDataId : {
        type : String,
        default : null,
    }
});


module.exports = model('City',citySchema);