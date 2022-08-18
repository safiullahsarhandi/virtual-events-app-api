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

const subCategoryRelation = {
  ref : 'Category',
  localField : '_id',
  foreignField : 'parent',

};
const productRelation = {
  ref : 'Product',
  localField : '_id',
  foreignField : 'category',
};
categorySchema.virtual('sub_categories',subCategoryRelation);

categorySchema.virtual('sub_categories_count',{...subCategoryRelation,count : true});

categorySchema.virtual('no_products',{...productRelation,count : true});



module.exports = mongoose.model("Category", categorySchema);
