const User = require("../models/User");
const Payment = require("../models/Payment");
const { subscriptionGraph, earningGraph } = require("../queries");

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      total_users,
      subscriptions_purchased,
      subscription_data,
      earning_stats,
    ] = await Promise.all([
      User.find().select("_id").countDocuments(),
      Payment.find({ amount_type: "Subscription" })
        .select("_id")
        .countDocuments(),
      subscriptionGraph(req.query.year),
      earningGraph(req.query.year),
    ]);

    await res.code(201).send({
      total_users,
      events_hosted: 0,
      subscriptions_purchased,
      event_stats: [],
      subscription_data,
      earning_stats,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};
