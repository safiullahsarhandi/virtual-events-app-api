const User = require("../models/User");
const Event = require("../models/Event");
const Payment = require("../models/Payment");
const { subscriptionGraph, earningGraph, eventGraph } = require("../queries");

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      total_users,
      subscriptions_purchased,
      events_hosted,
      subscription_data,
      earning_stats,
      event_stats,
    ] = await Promise.all([
      User.find().select("_id").countDocuments(),
      Payment.find({ amount_type: "Subscription" })
        .select("_id")
        .countDocuments(),
      Event.find().select("_id").countDocuments(),
      subscriptionGraph(req.query.year),
      earningGraph(req.query.year),
      eventGraph(req.query.year),
    ]);

    await res.code(201).send({
      total_users,
      events_hosted,
      subscriptions_purchased,
      event_stats,
      subscription_data,
      earning_stats,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};
