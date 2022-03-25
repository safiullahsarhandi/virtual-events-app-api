const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mongoosePaginate = require("mongoose-paginate-v2");

const subscriptionSchema = new Schema(
  {
    package: {
      type: Object,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    current_subscription_date: {
      type: Date,
      required: true,
    },
    renewal_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Active", "Inactive"],
    },
    // THE PRICE USER SUBSCRIBED AT
    subscription_price: {
      type: Number,
      required: true,
    },
    reoccouring: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

subscriptionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Subscription", subscriptionSchema);
