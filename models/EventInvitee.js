const {Schema,Types,model} = require('mongoose');

const inviteesListSchema = new Schema({
    eventId : {
        type : Types.ObjectId,
        required : true,
        ref : 'Event',        
    },
    email : {
        type : String,
        default : null,
    }
},{
    timestamps : true,
});

module.exports = model('EventInvitee',inviteesListSchema);