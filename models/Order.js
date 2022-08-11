const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mongoosePaginate = require("mongoose-paginate-v2");

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
  { timestamps: true }
);

orderSchema.plugin(mongoosePaginate);
// TEXT SEARCH IS NOT BEING APPLIED IN THE REPLICATION MONGODB INSTANCE
// INDEX IS NOT BEING CREATED.
// REPORT THIS ISSUE TO DEVOPS AND HOPE THEY FIX IT
// SEARCH WILL WORK ONCE THE INDEX HAS BEEN CREATED
orderSchema.index({ "$**": "text" });

module.exports = mongoose.model("Order", orderSchema);
