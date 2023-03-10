const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const eventCategory = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
    },
    room_index : {
      type: Number,
      default : 4,
    },
    inclueSubscription: {
      type: Boolean,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

eventCategory.plugin(mongoosePaginate);

module.exports = mongoose.model("EventCategory", eventCategory);
