const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mongoosePaginate = require("mongoose-paginate-v2");

const storySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "StoryCategory",
      required: true,
    },
    story_type: {
      type: String,
      required: true,
      enum: ["Textual", "Video", "Audio"],
    },
    title: {
      type: String,
      required: true,
    },
    sub_title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    cover_image: {
      type: String,
      required: true,
    },
    media: {
      type: String,
      required: false,
    },
    status: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

storySchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Story", storySchema);
