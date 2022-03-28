const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mongoosePaginate = require("mongoose-paginate-v2");

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
  { timestamps: true }
);

productSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Product", productSchema);
