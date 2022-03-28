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

      sub_total = product.price * quantity + sub_total + (sub_attr.price || 0);

      return {
        product: {
          ...product,
        },
        quantity,
        sub_attr,
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
