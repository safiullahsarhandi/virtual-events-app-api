const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    message: String,
    read: {
      type: Boolean,
      default: false,
    },
    to: String,
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    payload: {
      payloadType: String,
      id: String,
    },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

notificationSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Notification", notificationSchema);
