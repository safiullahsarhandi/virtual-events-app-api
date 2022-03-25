const moment = require("moment");

const Package = require("../models/Package");

exports.add = async (req, res) => {
  try {
    const { name, amount, details, duration } = req.body;

    const package = new Package({
      name,
      amount,
      duration,
      details,
      status: true,
    });

    await package.save();

    await res.code(201).send({
      message: "Package Created",
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.edit = async (req, res) => {
  try {
    const { id, name, amount, details, duration } = req.body;

    const package = await Package.findById(id);

    package.name = name;
    package.amount = amount;
    package.details = details;
    package.duration = duration;

    await package.save();

    await res.code(201).send({
      message: "Package Update",
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.changeStatus = async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);

    package.status = !package.status;

    await package.save();

    await res.code(201).send({
      message: package.status ? "Package Enabled" : "Package Disabled",
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
      ? { $text: { $search: req.query.searchString } }
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
    const logs = await Package.paginate(
      {
        ...searchParam,
        ...dateFilter,
      },
      {
        page: req.query.page,
        limit: req.query.perPage,
        lean: true,
        sort: "-_id",
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

exports.get = async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);
    await res.code(200).send({
      package,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};
