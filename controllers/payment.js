const Payment = require("../models/Payment");

exports.logs = async (req, res) => {
  try {
    const type_filter = req.query.type
      ? {
          amount_type:
            req.query.type === "0"
              ? "Subscription"
              : req.query.type === "1"
              ? "Order"
              : "Event",
        }
      : {};

    const populate_object =
      req.query.type === "0"
        ? {
            path: "subscription user",
            select: "package renewal_date name",
          }
        : req.query.type === "1"
        ? {
            path: "order user",
            select: "order_status name",
          }
        : {};

    const logs = await Payment.paginate(
      {
        ...type_filter,
      },
      {
        page: req.query.page,
        limit: req.query.perPage,
        lean: true,
        sort: "-_id",
        populate: populate_object,
      }
    );

    await res.code(200).send({
      logs,
    });
  } catch (err) {
    console.log(err);
    res.code(500).send({
      message: err.toString(),
    });
  }
};
