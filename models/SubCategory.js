const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true }
);

subCategorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model("SubCategory", subCategorySchema);
