const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mongoosePaginate = require("mongoose-paginate-v2");
const Payment = require("./Payment");

const subscriptionSchema = new Schema(
  {
    package: {
      type: Schema.Types.ObjectId,
      ref : 'Package',
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
      default: null,
    },
    renewal_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      default : 'Active',
      enum: ["Active", "Inactive"],
    },
    // THE PRICE USER SUBSCRIBED AT
    subscription_price: {
      type: Number,
      required: true,
    },
    reoccouring: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

subscriptionSchema.plugin(mongoosePaginate);

subscriptionSchema.methods.savePayLog = async function(amount,amount_type,charge_object,session = null){
  try {
      let payment = new Payment({
        user: this.user,
        payable_id : this._id,
        payable_type : 'Subscription',
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


module.exports = mongoose.model("Subscription", subscriptionSchema);
