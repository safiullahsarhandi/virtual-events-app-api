const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mongoosePaginate = require("mongoose-paginate-v2");
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Payment = require("./Payment");
const User = require("./User");
const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order_status: {
      type: String,
      required: true,
      enum: ["Pending", "In Process", "Delivered", "Refunded"],
    },
    billing_address: {
      country: {
        type: mongoose.Types.ObjectId,
        ref : 'Country',
        required: true,
      },
      first_name: {
        type: String,
        required: true,
      },
      last_name: {
        type: String,
        required: true,
      },
      street_address: {
        type: String,
        required: true,
      },
      state: {
        type: mongoose.Types.ObjectId,
        ref : 'State',
        required: true,
      },
      city: {
        type: mongoose.Types.ObjectId,
        ref : 'City',
        required: true,
      },
      zip_code: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      country_code: {
        type: String,
        default: null,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    shipping_address: {
      country: {
        type: mongoose.Types.ObjectId,
        ref : 'Country',
        required: true,
      },
      first_name: {
        type: String,
        required: true,
      },
      last_name: {
        type: String,
        required: true,
      },
      street_address: {
        type: String,
        required: true,
      },
      state: {
        type: mongoose.Types.ObjectId,
        ref : 'State',
        required: true,
      },
      city: {
        type: mongoose.Types.ObjectId,
        ref : 'City',
        required: true,
      },
      zip_code: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      country_code: {
        type: String,
        default: null,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    // products: [
    //   {
    //     product: {
    //       type: Schema.Types.ObjectId,
    //       ref : '',
    //       required: false,
    //     },
    //     quantity: {
    //       type: Number,
    //       required: true,
    //     },
    //     sub_attr: Object,
    //     main_attr: Object,
    //   },
    // ],
    // price_info: {
    //   sub_total: {
    //     type: Number,
    //     required: true,
    //   },
    //   shipping_fee: {
    //     type: Number,
    //     required: true,
    //   },
    //   tax: {
    //     type: Number,
    //     required: true,
    //   },
    //   total: {
    //     type: Number,
    //     required: true,
    //   },
    // },
  },
  { timestamps: true,
    toJSON : {
      virtuals : true,
    },
    toObject : {
      virtuals : true,
    },
 }
);

orderSchema.plugin(mongoosePaginate);
orderSchema.plugin(aggregatePaginate);
// TEXT SEARCH IS NOT BEING APPLIED IN THE REPLICATION MONGODB INSTANCE
// INDEX IS NOT BEING CREATED.
// REPORT THIS ISSUE TO DEVOPS AND HOPE THEY FIX IT
// SEARCH WILL WORK ONCE THE INDEX HAS BEEN CREATED
orderSchema.index({ "$**": "text" });

orderSchema.methods.savePayLog = async function(amount,amount_type,charge_object){
  try {
      await Payment.create({
        user: this.user,
        payable_id : this._id,
        payable_type : 'Order',
        amount,
        amount_type,
        charge_object,
        payment_status : 'Payment Completed',
      });
  } catch (error) {
      console.log(error);
      throw new Error(error.message);
  }
};
orderSchema.methods.pay = async function(cardId,amount) {
    try {
      
      let user = await User.findById(this.user);
      let charge = await user.charge(amount,cardId);
      this.savePayLog(amount,'Order Payment',charge);
    } catch (error) {
      throw new Error(error.message);
    }
};


orderSchema.virtual('products',{
  ref : 'OrderProduct',
  localField : '_id',
  foreignField : 'orderId',
});
module.exports = mongoose.model("Order", orderSchema);
