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
    parent: {
      type: Schema.Types.ObjectId,
      default : null,
      required: false,
    },
    /* sub_categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "SubCategory",
        required: true,
      },
    ], */
  },
  { timestamps: true, toJSON : {virtuals : true, getters : true,},toObject : {virtuals : true, getters : true,} }
);

categorySchema.plugin(mongoosePaginate);

categorySchema.virtual('sub_categories',{
  ref : 'Category',
  localField : 'parent',
  foreignField : '_id',

});

categorySchema.virtual('sub_categories_count',{
  ref : 'Category',
  localField : 'parent',
  foreignField : '_id',
  count : true,
});

categorySchema.virtual('no_products',{
  ref : 'Product',
  localField : '_id',
  foreignField : 'category',
  count : true,
});



module.exports = mongoose.model("Category", categorySchema);
