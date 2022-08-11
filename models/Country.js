const {model,Schema, plugin} = require('mongoose');

const countrySchema = new Schema({  
    id : Number,  
    name : String,
    iso3 : String,
    iso2 : String,
    phone_code : String,
    capital : String,
    currency : String,
    currency_name : String,
    currency_symbol : String,
    tld : String,
    native : String,
    region : String,
    subregion : String,
    timezones : [
        {
            zoneName : String,
            gmtOffset : Number,
            gmtOffsetName : String,
            tzName : String,
        }
    ],
    translations : Object,
    latitude : Object,
    emoji : Object,
    emojiU : Object,

});


module.exports = model('Country',countrySchema);