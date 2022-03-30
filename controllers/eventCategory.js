const moment = require("moment");
const { convertToLabelValue } = require("../mapping/labelValue");

const EventCategory = require("../models/EventCategory");

exports.add = async (req, res) => {
  try {
    const { name, cost, inclueSubscription } = req.body;

    const event_category = new EventCategory({
      name,
      cost,
      inclueSubscription,
      status: true,
    });

    await event_category.save();

    await res.code(201).send({
      message: "Event Category Created",
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id, name, cost, inclueSubscription } = req.body;
    const event_category = await EventCategory.findById(id);
    event_category.name = name;
    event_category.cost = cost;
    event_category.inclueSubscription = inclueSubscription;

    await event_category.save();

    await res.code(201).send({
      message: "Event Category Updated",
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

    const logs = await EventCategory.paginate(
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
    const category = await EventCategory.findById(req.params.id);
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

    const category = await EventCategory.findById(id).lean();

    await res.code(201).send({
      category,
    });
  } catch (err) {
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
      categories = await EventCategory.paginate(
        {},
        {
          page: 1,
          limit: 10,
          lean: true,
          select: "name",
        }
      );
      categories = categories.docs;
    } else {
      categories = await EventCategory.find({
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
