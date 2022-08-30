const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    sub_category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    about_product: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
    },
    avgRatings: {
      type: Number,
      default: 0,
    },
    attributes: [
      {
        label: String,
        value: Schema.Types.ObjectId,
        attribute_values: [
          {
            name: String,
            _id: Schema.Types.ObjectId,
            price: Number,
          },
        ],
      },
    ],
    images: {
      type: Array,
      required: true,
    },
  },
  { timestamps: true,
  toJSON : {
    virtuals : true,
  },toObject : {
    virtuals : true,
  } }
);

productSchema.plugin(mongoosePaginate);
productSchema.plugin(aggregatePaginate);

productSchema.virtual('isWishlist',{
  ref : 'Wishlist',
  localField : '_id',
  foreignField : 'productId',
  count : true, 
});

productSchema.virtual('total_ratings',{
  ref : 'Review',
  localField : '_id',
  foreignField : 'product',
  count : true,
});

module.exports = mongoose.model("Product", productSchema);
