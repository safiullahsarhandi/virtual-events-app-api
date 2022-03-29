const moment = require("moment");

const Feedback = require("../models/Feedback");

const { validateEmail } = require("../validations");

exports.addFeedback = async (req, res) => {
  const session = await Feedback.startSession();
  session.startTransaction();
  try {
    const opts = { session };
    const { name, email: _email, subject, message } = req.body;
    const email = validateEmail(_email);
    if (!email) throw new Error("Invalid Email Address");

    const feedback = new Feedback({
      name,
      email,
      subject,
      message,
    });

    await feedback.save(opts);

    await session.commitTransaction(opts);
    session.endSession(opts);

    await res.code(201).send({
      message: "Feedback Sent",
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
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
    const logs = await Feedback.paginate(
      {
        ...searchParam,
        ...dateFilter,
      },
      {
        page: req.query.page,
        limit: req.query.perPage,
        lean: true,
        sort: "-_id",
        select: "name email createdAt",
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

exports.getFeedbackDetails = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    await res.code(200).send({
      feedback,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};
