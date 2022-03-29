const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mongoosePaginate = require("mongoose-paginate-v2");

const feedbackSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

feedbackSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Feedback", feedbackSchema);

mongoose.model("Feedback", feedbackSchema).createIndexes();
