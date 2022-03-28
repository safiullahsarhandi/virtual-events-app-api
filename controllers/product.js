const moment = require("moment");

const Product = require("../models/Product");
const { ratingsBreakdown } = require("../services/calculate_avg_ratings");

const { delete_file } = require("../services/delete_file");

exports.addProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      about_product,
      status,
      attributes: _attributes,
    } = req.body;
    const attributes = JSON.parse(_attributes);

    const images = [];

    const _images = req.files.product_image;
    if (!_images || _images.length === 0)
      throw new Error("Please Select Product Image");

    _images.forEach((image) => {
      images.push(image.path);
    });

    const product = new Product({
      name,
      category,
      price,
      about_product,
      status,
      attributes,
      images,
    });

    await product.save();

    await res.code(201).send({
      message: "Product Created",
    });
  } catch (err) {
    if (
      req.files &&
      req.files.product_image &&
      req.files.product_image.length > 0
    )
      req.files.product_image.forEach((image) => {
        delete_file(image.path);
      });

    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const {
      id,
      name,
      category,
      price,
      about_product,
      status,
      attributes: _attributes,
      existing_images: _existing_images,
    } = req.body;
    const attributes = JSON.parse(_attributes);
    const existing_images = JSON.parse(_existing_images);
    const images = [];

    const _images = req.files.product_image ? req.files.product_image : [];

    _images.forEach((image) => {
      images.push(image.path);
    });

    const product = await Product.findById(id);
    product.name = name;
    product.category = category;
    product.price = price;
    product.about_product = about_product;
    product.status = status;
    product.attributes = attributes;
    product.images = [...existing_images, ...images];

    await product.save();

    await res.code(201).send({
      message: "Product Updated",
    });
  } catch (err) {
    if (
      req.files &&
      req.files.product_image &&
      req.files.product_image.length > 0
    )
      req.files.product_image.forEach((image) => {
        delete_file(image.path);
      });

    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.logs = async (req, res) => {
  try {
    const searchParam = req.query.searchString
      ? { name: { $regex: `${req.query.searchString}`, $options: "i" } }
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
    const status_filter = req.query.status
      ? { status: JSON.parse(req.query.status) }
      : {};
    const logs = await Product.paginate(
      {
        ...searchParam,
        ...dateFilter,
        ...status_filter,
      },
      {
        page: req.query.page,
        limit: req.query.perPage,
        lean: true,
        sort: "-_id",
        select: "name price status createdAt",
        populate: {
          path: "category",
          select: "name",
        },
      }
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
    const product = await Product.findById(req.params.id);
    product.status = !product.status;
    await product.save();
    await res.code(201).send({
      message: product.status ? "Product Activated" : "Product Deactivated",
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.getProductDetails = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean().populate({
      path: "category",
      select: "name",
    });
    const ratings = await ratingsBreakdown(product._id);
    await res.code(200).send({
      product,
      ratings,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};
