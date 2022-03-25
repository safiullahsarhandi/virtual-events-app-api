const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
    },
    category_image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    sub_categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "SubCategory",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

categorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Category", categorySchema);
