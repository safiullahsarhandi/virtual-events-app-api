const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

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
      required: true,
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
  },
  { timestamps: true }
);

eventSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Event", eventSchema);
