const moment = require("moment");

const Product = require("../models/Product");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const StoryCategory = require("../models/StoryCategory");

const { delete_file } = require("../services/delete_file");
const { convertToLabelValue } = require("../mapping/labelValue");

exports.addCategory = async (req, res) => {
  const session = await Category.startSession();
  try {
    session.withTransaction(async () => {
      const opts = { session };
      const {
        name,
        status,
        sub_categories: _sub_categories,
        description,
      } = req.body;
      const category_image =
        req.files &&
        req.files.category_image &&
        req.files.category_image[0] &&
        req.files.category_image[0].path;
      const sub_categories = JSON.parse(_sub_categories);

      const category = new Category({
        name,
        status,
        description,
        category_image,
        sub_categories,
      });

      await Promise.all(
        sub_categories.map(async (sub_category) => {
          const used_sub = await SubCategory.findById(sub_category);
          used_sub.used = true;
          await used_sub.save(opts);
        })
      );

      await category.save(opts);

      await session.commitTransaction(opts);
      session.endSession(opts);

      await res.code(201).send({
        message: "Category Created",
      });
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    const category_image =
      req.files &&
      req.files.category_image &&
      req.files.category_image[0] &&
      req.files.category_image[0].path;

    if (category_image) delete_file(category_image);

    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.logs = async (req, res) => {
  try {
    const searchParam = req.query.searchString
      ? {
          name: {
            $regex: `${req.query.searchString}`,
            $options: "i",
          },
        }
      : {};
    const from = req.query.from ? req.query.from : null;
    const to = req.query.to ? req.query.to : null;
    let dateFilter = {};
    if (from && to)
      dateFilter = {
        createdAt: {
          $gte: moment(new Date(from)).startOf("day"),
          $lte: moment(new Date(to)).endOf("day"),
        },
      };
    const status_filter = req.query.status ? { status: req.query.status } : {};
    const logs = await Category.paginate(
      {
        ...dateFilter,
        ...searchParam,
        ...status_filter,
      },
      {
        page: req.query.page,
        limit: req.query.perPage,
        lean: true,
      }
    );

    await Promise.all(
      logs.docs.map(async (log) => {
        log.no_products = await Product.find({ category: log._id })
          .select("_id")
          .countDocuments();
      })
    );

    await res.code(200).send({
      logs,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.changeStatus = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    category.status = !category.status;

    await category.save();

    await res.code(201).send({
      message: category.status ? "Category Enabled" : "Category Disabled",
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.get = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id).lean().populate({
      path: "sub_categories",
      select: "name",
    });

    await res.code(201).send({
      category,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.updateCategory = async (req, res) => {
  const session = await Category.startSession();
  session.startTransaction();
  try {
    const opts = { session };
    const {
      id,
      name,
      status,
      sub_categories: _sub_categories,
      description,
      old_sub_categories: _old_sub_categories,
    } = req.body;
    const new_category_image =
      req.files &&
      req.files.category_image &&
      req.files.category_image[0] &&
      req.files.category_image[0].path;
    const sub_categories = JSON.parse(_sub_categories);
    const old_sub_categories = JSON.parse(_old_sub_categories);

    const category = await Category.findById(id);
    const image_to_delete = category.category_image;

    category.name = name;
    category.status = status;
    category.sub_categories = sub_categories;
    category.description = description;
    category.category_image = new_category_image
      ? new_category_image
      : category.category_image;

    await Promise.all(
      sub_categories.map(async (sub_category) => {
        const used_sub = await SubCategory.findById(sub_category);
        used_sub.used = true;
        await used_sub.save(opts);
      })
    );

    const filteredArray = old_sub_categories.filter(
      (value) => !sub_categories.includes(value)
    );

    await Promise.all(
      filteredArray.map(async (sub_category) => {
        const used_sub = await SubCategory.findById(sub_category);
        console.log("used_sub: ", used_sub);
        used_sub.used = false;
        await used_sub.save(opts);
      })
    );

    await category.save(opts);

    await session.commitTransaction(opts);
    session.endSession(opts);

    await res.code(201).send({
      message: "Category Updated",
    });
    if (image_to_delete && new_category_image) delete_file(image_to_delete);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    const category_image =
      req.files &&
      req.files.category_image &&
      req.files.category_image[0] &&
      req.files.category_image[0].path;

    if (category_image) delete_file(category_image);

    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.searchCategory = async (req, res) => {
  try {
    const searchParam = req.query.searchString
      ? { name: { $regex: `${req.query.searchString}`, $options: "i" } }
      : {};
    let categories;
    if (!req.query.searchString) {
      categories = await Category.paginate(
        {
          status: true,
        },
        {
          page: 1,
          limit: 10,
          lean: true,
          select: "name",
        }
      );
      categories = categories.docs;
    } else {
      categories = await Category.find({
        status: true,
        ...searchParam,
      })
        .select("name")
        .lean();
    }
    categories = convertToLabelValue(categories, "_id", "name");

    await res.code(200).send({
      categories,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.allCategories = async (req,res)=> {
  try {
    const limit = req.query.entries? req.query.entries: 10;   
    const currentPage = req.query.page? req.query.page: 1;   
    const {docs,page, totalPages : total} = await Category.paginate({
      status: true,
    },{
      page : currentPage,
      limit, 
    });

    await res.code(200).send({
      data : docs,
      total,
      currentPage : page,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};



exports.storyCategories = async (req,res)=> {
  try {
    const categories = await StoryCategory.find();

    await res.code(200).send({
      categories,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};