const moment = require("moment");

const User = require("../models/User");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Product = require("../models/Product");
const {
  refundPayment,
  makePayment,
  createCustomerStripe,
} = require("../services/stripe");

exports.createOrder = async (req, res) => {
  const session = await Order.startSession();
  session.startTransaction();
  let charge_id, total_global;
  try {
    const opts = { session };
    const {
      billing_address,
      shipping_address,
      product_ids,
      card_number,
      card_expiry_month,
      card_expiry_year,
      cvv,
    } = req.body;
    const ids = product_ids.map((product_id) => product_id.id);
    let products = await Product.find({
      _id: {
        $in: ids,
      },
    })
      .select("name price attributes")
      .lean();

    let sub_total = 0,
      shipping_fee = 0,
      tax = 0,
      total = 0;

    products = products.map((product, index) => {
      const quantity = product_ids[index].quantity;
      const main_attribute = product_ids[index].main_attribute;
      const sub_attribute = product_ids[index].sub_attribute;
      const main_attr = product.attributes.find(
        (attr) => main_attribute === attr._id.toString()
      );
      const sub_attr = main_attr.attribute_values.find(
        (sub_attr) => sub_attribute === sub_attr._id.toString()
      );

      delete product.attributes;
      delete main_attr.attribute_values;

      sub_total = product.price * quantity + sub_total + (sub_attr.price || 0);

      return {
        product: {
          ...product,
        },
        quantity,
        sub_attr,
        main_attr,
      };
    });

    total = sub_total + shipping_fee + tax;
    total_global = total;

    const user = await User.findById(req.user.userId).populate("auth");

    const order = new Order({
      user: user._id,
      order_status: "Pending",
      billing_address,
      shipping_address,
      products,
      price_info: {
        sub_total,
        shipping_fee,
        tax,
        total,
      },
    });

    await order.save(opts);

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
      order: order._id,
      amount: total,
      amount_type: "Order",
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

    await session.commitTransaction();
    session.endSession();

    await res.code(201).send({
      message: "Order Placed",
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    if (charge_id && total_global) {
      await refundPayment(charge_id, total_global);
    }

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
    const status_filter = req.query.status
      ? { order_status: req.query.status }
      : {};
    const user_filter = req.user.scope.is_user
      ? {
          user_id: req.user.userId,
        }
      : {};
    const user_filter_admin = req.query.user ? { user_id: req.query.user } : {};
    const logs = await Order.paginate(
      {
        ...searchParam,
        ...dateFilter,
        ...status_filter,
        ...user_filter_admin,
        ...user_filter,
      },
      {
        page: req.query.page,
        limit: req.query.perPage,
        lean: true,
        sort: "-updatedAt",
        select: "name price_info order_status createdAt billing_address",
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

exports.changeOrderStatus = async (req, res) => {
  const session = await Order.startSession();
  session.startTransaction();
  try {
    const opts = { session };
    const { status, id } = req.body;
    if (
      status !== "Pending" &&
      status !== "In Process" &&
      status !== "Delivered" &&
      status !== "Refunded"
    ) {
      return res.code(400).send({
        message: "Invalid Status",
        accepted: ["Pending", "In Process", "Delivered", "Refunded"],
      });
    }
    const order = await Order.findById(id);
    if (!order) return res.code(400).send({ message: "Invalid Order" });
    if (status === "Refunded") {
      const payment = await Payment.findOne({
        order: order._id,
      });
      const refund_object = await refundPayment(
        payment.charge_object.id,
        order.price_info.total
      );
      payment.refund_object = refund_object;
      payment.payment_status = "Refunded";
      await payment.save(opts);
    }
    order.order_status = status;
    await order.save(opts);

    await session.commitTransaction();
    session.endSession();

    await res.code(201).send({
      message:
        status === "Refunded" ? "Order Refunded" : "Order Status Updated",
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.log(err);
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.orderDetails = async (req, res) => {
  try {
    let order = await Order.findOne({
      _id: req.params.id,
    })
      .lean()
      .populate({
        path: "user",
        select: "name auth",
        populate: {
          path: "auth",
          select: "email",
        },
      });

    await res.code(200).send({
      order,
    });
  } catch (err) {
    console.log(err);
    res.code(500).send({
      message: err.toString(),
    });
  }
};



exports.placeOrder = async (req,res)=> {
    let session = await Order.startSession();
    session.startTransaction();
    try {
      let opts = { session };
      let {billing,shipping} = req.body;
      let order = new Order({
        billing_address : billing,  
        shipping_address : shipping,  
        order_status : 'Pending',
        user : req.userId,
      });

      order.save(opts);
      // OrderProduct.
      await session.commitTransaction();
      session.endSession();
    } catch (error) {
        await session.abortTransaction();
        res.code(500).send({
          message : error.toString(),
        });
    }
}