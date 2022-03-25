const moment = require("moment");

const User = require("../models/User");

const { validateEmail } = require("../validations");

exports.logs = async (req, res) => {
  try {
    const searchParam =
      req.query.searchString && !validateEmail(req.query.searchString)
        ? {
            $or: [
              {
                name: {
                  $regex: `${req.query.searchString}`,
                  $options: "i",
                },
              },
              {
                phone: {
                  $regex: `${req.query.searchString}`,
                  $options: "i",
                },
              },
            ],
          }
        : {};
    const searchEmail = req.query.searchString
      ? validateEmail(req.query.searchString)
        ? {
            email: {
              $regex: `${req.query.searchString}`,
              $options: "i",
            },
          }
        : {}
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
    const logs = await User.paginate(
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
        populate: {
          path: "auth",
          select: "email",
          match: {
            ...searchEmail,
          },
        },
        select: "auth name createdAt status phone",
      }
    );

    logs.docs = logs.docs.filter((doc) => doc.auth);

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
    const user = await User.findById(req.params.id);
    user.status = !user.status;
    await user.save();
    await res.code(201).send({
      message: user.status ? "User Activated" : "User Deactivated",
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.userDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("auth", "email")
      .lean();
    await res.code(200).send({
      user,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};
