const { convertToLabelValue } = require("../mapping/labelValue");
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
    const searchParam = req.query.searchString
      ? { name: { $regex: `${req.query.searchString}`, $options: "i" } }
      : {};
    let sub_categories;
    if (!req.query.searchString) {
      sub_categories = await SubCategory.paginate(
        {
          status: true,
          used: false,
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
      sub_categories = await SubCategory.find({
        status: true,
        used: false,
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
