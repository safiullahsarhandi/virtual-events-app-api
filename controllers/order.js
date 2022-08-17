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
const OrderProduct = require("../models/OrderProduct");
const { Types } = require("mongoose");

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


exports.placeOrder = async (req, res) => {
  let session = await Order.startSession();
  session.startTransaction();
  try {
    let opts = { session };
    // extract params;
    let { billing, shipping, products, card: cardId } = req.body;
    let order = new Order({
      billing_address: billing,
      shipping_address: shipping,
      order_status: 'Pending',
      user: req.user.userId,
    });

    await order.save(opts);
    products.forEach(item => (item.orderId = order._id));
    await OrderProduct.insertMany(products);
    // calculating order total 
    let total = products.reduce((prevValue, current) => (prevValue += (parseInt(current.price) * parseInt(current.qty))), 0);
    // pay order amount 
    await order.pay(cardId, total);

    await session.commitTransaction();
    session.endSession();
    res.code(201).send({
      message: 'order has been placed successfully',
      status: true,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.code(500).send({
      message: error.toString(),
    });
  }
}


exports.getMyOrders = async (req, res) => {
  try {
    let { limit, page, order,status } = req.query;
    page = page || 1;
    limit = limit || 10;
    order = order || 'descending';
    let statusFilter = status?{order_status : status}: {};    
    let aggregation;
    aggregation = Order.aggregate()
    if(statusFilter)
      aggregation = aggregation.match(statusFilter)
    
    aggregation.lookup({
        from: 'orderproducts',
        localField: '_id',
        foreignField: 'orderId',
        as: 'order_products',
      })
      .addFields({
        total: {
          $reduce: {
            input: '$order_products',
            initialValue: 0,
            in: {
              $add: ['$$value', { $multiply: ['$$this.price', '$$this.qty'] }]
            }
          }
        },
        customer_name : {
          $concat : ['$billing_address.first_name',' ','$billing_address.last_name']
        },
        customer_email : '$billing_address.email'
      }).project({
        order_products: 0,
      });

    let { docs: data, totalPages: total } = await Order.aggregatePaginate(aggregation, {
      limit,
      page,
      sort : {
        _id : order,
      }
    });
    res.send({
      data,
      perPage : limit,
      currentPage : page,
      total,
    });
  } catch (error) {
    console.log(error);
  }
} 



exports.getOrderDetail = async (req,res)=> {
  try {
    let {id} = req.params;
    let order = await Order.aggregate()
      .match({
        _id : Types.ObjectId(id),
      })
      .lookup({
        from: 'orderproducts',
        localField: '_id',
        foreignField: 'orderId',
        as: 'products',
        pipeline : [
          {
            $lookup : {
              from: 'products',
              localField: 'productId',
              foreignField: '_id',
              as: 'product',
            }
          },
          {
            $unwind : '$product'
          }
        ],
      })
      // join country
      .lookup({
        from: 'countries',
        localField: 'billing_address.country',
        foreignField: '_id',
        as: 'billing_address.country',
      })
      .unwind('$billing_address.country')
      // join city
      .lookup({
        from: 'cities',
        localField: 'billing_address.city',
        foreignField: '_id',
        as: 'billing_address.city',
      })
      .unwind('$billing_address.city')
      
      // join state
      .lookup({
        from: 'states',
        localField: 'billing_address.state',
        foreignField: '_id',
        as: 'billing_address.state',
      })
      .unwind('$billing_address.state')
      
      // join country
      .lookup({
        from: 'countries',
        localField: 'shipping_address.country',
        foreignField: '_id',
        as: 'shipping_address.country',
      })
      .unwind('$shipping_address.country')
      // join city
      .lookup({
        from: 'cities',
        localField: 'shipping_address.city',
        foreignField: '_id',
        as: 'shipping_address.city',
      })
      .unwind('$shipping_address.city')
      
      // join state
      .lookup({
        from: 'states',
        localField: 'shipping_address.state',
        foreignField: '_id',
        as: 'shipping_address.state',
      })
      .unwind('$shipping_address.state')
      
      .addFields({
        total: {
          $reduce: {
            input: '$products',
            initialValue: 0,
            in: {
              $add: ['$$value', { $multiply: ['$$this.price', '$$this.qty'] }]
            }
          }
        },
      })

    res.send({
      order : order[0] || null,
    })
  } catch (error) {
      console.log(error);
  }
};