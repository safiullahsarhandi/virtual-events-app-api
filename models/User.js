const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mongoosePaginate = require("mongoose-paginate-v2");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    user_image: {
      type: String,
      required: false,
      get: (path)=> `${process.env.BASE_URL}/${path}`,
    },
    phone: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
    },
    auth: {
      type: Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    subscription: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      required: false,
    },
    stripe_customer: Object,
    is_subscribed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, toJSON : {getters : true}, toObject :{ getters : true,} }
);

userSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("User", userSchema);
