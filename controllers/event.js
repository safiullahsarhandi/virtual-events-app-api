const moment = require("moment");

const User = require("../models/User");
const Event = require("../models/Event");
const Payment = require("../models/Payment");
const EventCategory = require("../models/EventCategory");
const {
  refundPayment,
  createCustomerStripe,
  makePayment,
} = require("../services/stripe");

exports.hostEvent = async (req, res) => {
  const session = await Event.startSession();
  let charge_id, total_global;
  session.withTransaction(async () => {
    try {
      const opts = { session };
      const {
        name,
        event_category: _event_category,
        date,
        time,
        guest_of_honor,
        event_elements,
        card_number,
        card_expiry_month,
        card_expiry_year,
        cvv,
      } = req.body;

      const event_category = await EventCategory.findById(_event_category);

      if (!event_category) throw new Error("Invalid Event Category");

      const total = event_category.cost;
      total_global = total;

      const user = await User.findById(req.user.userId).populate("auth");

      const event = new Event({
        user: user._id,
        event_category,
        name,
        date,
        time,
        guest_of_honor,
        event_elements,
        event_cost: total,
        event_type: "Subscription",
      });

      if (!event_category.inclueSubscription || !user.is_subscribed) {
        event.event_type = "Pay Per Event";
        event.save(opts);

        const stripe_user = await createCustomerStripe(
          user,
          user.auth.email,
          card_number,
          card_expiry_month,
          card_expiry_year,
          cvv
        );
        user.stripe_customer = stripe_user;

        await user.save(opts);

        const payment = new Payment({
          user: user._id,
          event: event._id,
          amount: total,
          amount_type: "Event",
        });

        const charge_object = await makePayment(
          card_number,
          card_expiry_month,
          card_expiry_year,
          cvv,
          total,
          stripe_user
        );
        payment.charge_object = charge_object;
        charge_id = charge_object.id;

        if (charge_object.status === "succeeded") {
          payment.payment_status = "Payment Completed";
        }

        await payment.save(opts);
      } else {
        event.save(opts);
      }

      await session.commitTransaction();
      session.endSession();

      await res.code(201).send({
        message: user.is_subscribed
          ? "Event Created Using Subscription"
          : "Event Created Without Using Any Subscription",
      });
    } catch (err) {
      if (charge_id && total_global) {
        await refundPayment(charge_id, total_global);
      }
      await session.abortTransaction();
      session.endSession();

      res.code(500).send({
        message: err.toString(),
      });
    }
  });
};

exports.logs = async (req, res) => {
  try {
    const searchParam = req.query.searchString
      ? { name: { $regex: `${req.query.searchString}`, $options: "i" } }
      : {};

    let dateFilter = {};
    if (req.query.selected === "0")
      dateFilter = {
        date: {
          $gte: moment(new Date()).startOf("day"),
        },
      };
    else
      dateFilter = {
        date: {
          $lte: moment(new Date()).endOf("day"),
        },
      };

    const status_filter = req.query.status
      ? { event_type: req.query.status }
      : {};

    const user_filter_admin = req.query.user ? { user: req.query.user } : {};

    const event_category = req.query.event_category
      ? { event_category: req.query.event_category }
      : {};

    const logs = await Event.paginate(
      {
        ...dateFilter,
        ...searchParam,
        ...status_filter,
        ...event_category,
        ...user_filter_admin,
      },
      {
        page: req.query.page,
        limit: req.query.perPage,
        lean: true,
        sort: "-_id",
        populate: {
          path: "user event_category",
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

exports.get = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id).lean().populate({
      path: "event_category",
      select: "name",
    });

    await res.code(201).send({
      event,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};
