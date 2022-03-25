const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mongoosePaginate = require("mongoose-paginate-v2");

const packageSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    duration: {
      // IN MONTHS
      type: Number,
      required: true,
    },
    details: {
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

packageSchema.index({ name: "text" });
packageSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Package", packageSchema);
