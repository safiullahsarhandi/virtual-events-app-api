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
    payable_id : {
      type: Schema.Types.ObjectId,
      required: true,      
    },
    payable_type : {
      type: String,
      required: true,      
    },
    /* subscription: {
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: false,
    }, */
    /* event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: false,
    }, */
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
    refund_object: {
      type: Object,
      required: false,
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
