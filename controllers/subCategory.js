const { Types } = require("mongoose");
const { convertToLabelValue } = require("../mapping/labelValue");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");

exports.add = async (req, res) => {
  try {
    const { name, status } = req.body;

    const sub_category = new SubCategory({
      name,
      status,
    });

    await sub_category.save();

    await res.code(201).send({
      message: "Category Created",
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id, name, status } = req.body;
    const sub_category = await SubCategory.findById(id);
    sub_category.name = name;
    sub_category.status = status;

    await sub_category.save();

    await res.code(201).send({
      message: "Sub Category Updated",
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.searchSubCategory = async (req, res) => {
  try {
    let {parent,searchString} = req.query;
    const searchParam = searchString
      ? { name: { $regex: `${searchString}`, $options: "i" } }
      : {};
    let sub_categories;
    if (!searchString) {
      sub_categories = await Category.paginate(
        {
          parent : Types.ObjectId(parent),
          status: true,
          ...searchParam,
        },
        {
          page: 1,
          limit: 10,
          lean: true,
          select: "name",
        }
      );
      sub_categories = sub_categories.docs;
    } else {
      sub_categories = await Category.find({
        parent : Types.ObjectId(parent),
        status: true,
        ...searchParam,
      })
        .select("name")
        .lean();
    }
    sub_categories = convertToLabelValue(sub_categories, "_id", "name");

    await res.code(200).send({
      sub_categories,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};
