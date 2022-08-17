const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mongoosePaginate = require("mongoose-paginate-v2");
const Card = require("./Card");
const Stripe = require('stripe');
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
  { timestamps: true, toJSON : {getters : true,virtual: true}, toObject :{ virtual:true, getters : true,} }
);

userSchema.virtual('saved_cards',{
  ref : Card,
  localField : '_id',
  foreignField : 'userId',

});


userSchema.plugin(mongoosePaginate);

userSchema.methods.charge = async function(amount,cardId){
    
  
  try {
    const stripe = Stripe(process.env.STRIPE_KEY);
    console.log(amount); 
    return await stripe.charges.create({
      amount: parseFloat(amount) * 100,
      currency: "GBP",
      customer: this.stripe_customer.id,
      source : cardId,
    })
  } catch (error) {
      console.log(error)
      throw new Error(error.message);
  }
};
module.exports = mongoose.model("User", userSchema);
