const {Schema,Types,model} = require('mongoose');

const inviteesListSchema = new Schema({
    eventId : {
        type : Types.ObjectId,
        required : true,
        ref : 'Event',        
    },
    userId : {
        type : Types.ObjectId,
        required : false,
        default : null,
        ref : 'User',        
    },
    status : {
        type : String,
        default : 'Pending',
        enum : ['Pending','Accepted','Declined','Attended','Ended'],
        ref : 'User',        
    },
    email : {
        type : String,
        default : null,
    }
},{
    timestamps : true,
    toJSON : { virtuals : true,},
    toObject : { virtuals : true,},
});

inviteesListSchema.virtual('user',{
    ref : 'User',
    localField : 'userId',
    foreignField : '_id',
    justOne : true,
});

module.exports = model('EventInvitee',inviteesListSchema);