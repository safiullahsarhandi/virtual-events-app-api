const moment = require("moment");

const User = require("../models/User");
const Package = require("../models/Package");
const Payment = require("../models/Payment");
const Subscription = require("../models/Subscription");
const Stripe = require('stripe');
const {
  createCustomerStripe,
  makePayment,
  refundPayment,
} = require("../services/stripe");

exports.subscribe = async (req, res) => {
  const session = await Subscription.startSession();
  session.startTransaction();
  let charge_id, amount;
  try {
    const {
      card, 
      id : package_id,
      reoccouring,
    } = req.body;
    const opts = { session };

    const package = await Package.findById(package_id);
    if (!package) throw new Error("Invalid Package");
    const user = await User.findById(req.user.userId).populate("auth", "email");

    if (user.subscription) {
      const old_subscription = await Subscription.findById(user.subscription);
      old_subscription.status = "Inactive";
      await old_subscription.save(opts);
    }

    amount = package.amount;


    const subscription = new Subscription({
      user: req.user.userId,
      package : package._id,
      renewal_date: new Date(
        new Date().setMonth(new Date().getMonth() + package.duration)
      ),
      subscription_price: package.amount,
      reoccouring : true,
    });
    
    var payment = await user.charge(package.amount,card);
    charge_id = payment.id;

    if (payment.status !== "succeeded") {
      await session.abortTransaction();
      session.endSession();
    }
    await user.save(opts);
    await subscription.save(opts);
    
    payment = await subscription.savePayLog(package.amount,'Subscription Payment',payment,opts);
    subscription.payment = payment; 
    await subscription.save(opts);
    
    await session.commitTransaction();
    session.endSession();

    await res.code(200).send({
      status : false,
      message: "Package Subscribed",
    });
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    session.endSession();

    if (charge_id) {
      const refund = await refundPayment(charge_id, amount);
      if (refund.status === "succeeded") is_refunded = true;
    }

    res.code(500).send({
      status : false,
      message: err.toString(),
    });
  }
};

exports.logs = async (req, res) => {
  try {
    const searchParam = req.query.searchString
      ? {
          $or: [
            {
              "package.name": {
                $regex: `${req.query.searchString}`,
                $options: "i",
              },
            },
          ],
        }
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

    const user_filter = req.query.user
      ? {
          user: req.query.user,
        }
      : {};

    const logs = await Subscription.paginate(
      {
        ...dateFilter,
        ...searchParam,
        ...user_filter,
      },
      {
        page: req.query.page,
        limit: req.query.perPage,
        lean: true,
        sort: "-_id",
        populate: {
          path: "user",
          select: "name",
        },
        select:
          "user package reoccouring current_subscription_date renewal_date subscription_price status",
      }
    );

    logs.docs = logs.docs.filter((log) => log.user);

    await res.code(200).send({
      logs,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};


exports.getPlans = async (req,res)=> {
  try {
    let {page} = req.query;
    if(!page){
        
        const packages = await Package.find({
        status : true,
      });  
      return res.send({packages});
    }
    const {docs : data, totalPages : total,pagingCounter : from} = await Package.paginate({
      
    },{
      page,
    });
    return res.send({
      data,
      currentPage : page,
      total,
      from
    });
  } catch (error) {
      console.log(error);
  }
}


exports.getPlan = async (req,res)=> {
  try {
    const plan = await Package.findById(req.params.id);  
    res.send({plan});
  } catch (error) {
    
  }
}


