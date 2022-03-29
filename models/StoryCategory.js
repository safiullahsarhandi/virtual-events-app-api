const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");

const storyCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

storyCategorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model("StoryCategory", storyCategorySchema);
