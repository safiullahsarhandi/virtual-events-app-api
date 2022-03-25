const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mongoosePaginate = require("mongoose-paginate-v2");

const attributeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    attribute_values: [
      {
        name: {
          type: String,
          required: true,
        },
      },
    ],
    status: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
    emitIndexErrors: true,
    autoIndex: false,
    autoCreate: true,
  }
);

attributeSchema.index({ name: "text" });
attributeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Attribute", attributeSchema);

mongoose.model("Attribute", attributeSchema).createIndexes();
