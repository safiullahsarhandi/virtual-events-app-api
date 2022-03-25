const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mongoosePaginate = require("mongoose-paginate-v2");

const paymentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subscription: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    amount_type: {
      type: String,
      required: true,
    },
    charge_object: {
      type: Object,
      required: true,
    },
    payment_status: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

paymentSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Payment", paymentSchema);
