const moment = require("moment");

const Attribute = require("../models/Attribute");

exports.addAttribute = async (req, res) => {
  try {
    const { name, sku, attribute_values, status } = req.body;

    const sku_exists = await Attribute.exists({ sku });
    if (sku_exists) throw new Error("SKU Already Used");

    const attribute = new Attribute({
      name,
      sku,
      attribute_values,
      status,
    });

    await attribute.save();

    await res.code(201).send({
      message: "Attributed Created",
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.editAttribute = async (req, res) => {
  try {
    const { id, name, sku, attribute_values, status } = req.body;

    const sku_exists = await Attribute.exists({ sku, _id: { $ne: id } });
    if (sku_exists) throw new Error("SKU Already Used");

    const attribute = await Attribute.findById(id);

    attribute.sku = sku;
    attribute.name = name;
    attribute.attribute_values = attribute_values;
    attribute.status = status;

    await attribute.save();

    await res.code(201).send({
      message: "Attribute Updated",
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.getAttribute = async (req, res) => {
  try {
    const attribute = await Attribute.findById(req.params.id);
    await res.code(200).send({
      attribute,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.logs = async (req, res) => {
  try {
    const searchParam = req.query.searchString
      ? {
          $or: [
            { name: { $regex: `${req.query.searchString}`, $options: "i" } },
            { sku: { $regex: `${req.query.searchString}`, $options: "i" } },
          ],
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
    const status_filter = req.query.status
      ? { status: JSON.parse(req.query.status) }
      : {};
    const logs = await Attribute.paginate(
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
        select: "name status sku",
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
    const attribute = await Attribute.findById(req.params.id);
    attribute.status = !attribute.status;
    await attribute.save();
    await res.code(201).send({
      message: "Attribute Saved",
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.getAttributesMin = async (req, res) => {
  try {
    const searchParam = req.query.searchString
      ? {
          $or: [
            { name: { $regex: `${req.query.searchString}`, $options: "i" } },
            { sku: { $regex: `${req.query.searchString}`, $options: "i" } },
          ],
        }
      : {};
    let attributes;
    if (!req.query.searchString) {
      attributes = await Attribute.paginate(
        {
          status: true,
        },
        {
          page: 1,
          limit: 10,
          lean: true,
          select: "attribute_values name",
        }
      );
      attributes = attributes.docs;
    } else {
      attributes = await Attribute.find({
        status: true,
        ...searchParam,
      })
        .lean()
        .select("attribute_values name");
    }
    attributes = attributes.filter((attr) => attr.name);
    await res.code(200).send({
      attributes,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};
