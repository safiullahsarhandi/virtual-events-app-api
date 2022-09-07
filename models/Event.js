const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const File = require("./File");
const Payment = require("./Payment");

const eventSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event_category: {
      type: Schema.Types.ObjectId,
      ref: "EventCategory",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    guest_of_honor: {
      type: String,
      required: true,
    },
    event_elements: {
      type: Array,
      required: false,
    },
    event_cost: {
      type: Number,
      required: true,
      // POPULATE THIS FROM EVENT CATEGORY
    },
    event_type: {
      type: String,
      required: true,
      enum: ["Pay Per Event", "Subscription"],
    },
    room_data: {
      type: Object,
      default: null,
    },
    repeat: {
      type: String,
      default: 'once',
      enum: ["once", "1","3",'unlimited'],
    },
    upload_allowed: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      default: 'Pending',
      enum : ['Pending','Completed'],
    },    
    
  },
  { timestamps: true,toJSON : {virtuals : true},toObject : {virtuals : true} }
);

let inviteeRelation ={
  ref : 'EventInvitee',
  localField : '_id',
  foreignField : 'eventId',
  as : 'invitees'  
};
eventSchema.virtual('invitees',inviteeRelation);
eventSchema.virtual('attendees_count',{
  ...inviteeRelation,
  count : true,
});

eventSchema.virtual('media',{
  ref : File,
  localField : '_id',
  foreignField : 'fileableId',
  justOne : true,
  match : {
    fileableType : 'Event',
  }  
});

eventSchema.methods.savePaylogs = async function(amount,amount_type,charge_object,session = null){
  try {
      let payment = new Payment({
        user: this.user,
        payable_id : this._id,
        payable_type : 'Event',
        amount,
        amount_type,
        charge_object,
        payment_status : 'Payment Completed',
      });
      if(session){
          return await payment.save(session);
      }else{
          return await payment.save();          
      }
  } catch (error) {
      console.log(error);
      throw new Error(error.message);
  }
};
eventSchema.virtual('user_detail',{
  ref : 'User', 
  localField : 'user',
  foreignField : '_id',
  justOne : true,
});

eventSchema.index({name : 'text'});
eventSchema.plugin(mongoosePaginate);
eventSchema.plugin(aggregatePaginate);


module.exports = mongoose.model("Event", eventSchema);
