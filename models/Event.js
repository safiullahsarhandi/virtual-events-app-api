const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");
const File = require("./File");

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
    repeat: {
      type: String,
      default: 'once',
      enum: ["once", "1","3",'unlimited'],
    },
    upload_allowed: {
      type: Boolean,
      default: true,
    },    
    
  },
  { timestamps: true,toJSON : {virtuals : true},toObject : {virtuals : true} }
);

eventSchema.virtual('invitees',{
  ref : 'EventInvitee',
  localField : '_id',
  foreignField : 'eventId',
  as : 'invitees'  
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


eventSchema.index({name : 'text'});
eventSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Event", eventSchema);
