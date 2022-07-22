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
      get: (path)=> `${process.env.BASE_URL}/${path}`,
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
  { timestamps: true, toJSON : {getters : true,},toObject : {getters : true,} }
);

categorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Category", categorySchema);
