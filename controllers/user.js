const moment = require("moment");

const User = require("../models/User");
const Country = require("../models/Country");
const State = require("../models/State");
const City = require("../models/City");

const { validateEmail } = require("../validations");
const { Types } = require("mongoose");
const Mail = require("../core/Mail/Mail");
const { view } = require("../core/helpers");

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
      .populate("subscription")
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


exports.getCountries = async (req,res)=> {
  try {
    let countries = await Country.find();

    res.send({
      countries
    });
  } catch (error) {
      console.log(error);
  }
};

exports.getStates = async (req,res)=> {
  try {
    let {countryId} = req.params;
    
    let states = await State.find({
        country_id : countryId,
    });

    res.send({
      states
    });
  } catch (error) {
      console.log(error);
  }
};


exports.getCities = async (req,res)=> {
  try {
    let {stateId} = req.params;
    
    let cities = await City.find({
        state_id : Types.ObjectId(stateId),
    });

    res.send({
      cities
    });
  } catch (error) {
      console.log(error);
  }
};


exports.contactUs = async (req,res)=> {
    try {
      await (new Mail)
      .to(process.env.ADMIN_EMAIL)
      .subject('Could you tell | Contact Us')
      .message(await view('contact-us.ejs',req.body))
      .send();
      res.code(200).send({
        message : 'Thank\'s for sending these details. you will hear from us soon!',
        status : true,
      });
    } catch (error) {
      console.log(error);
      res.code(500).send({
        message : 'something went wrong',
        meta : error.toString(),
        status : false,
      })
    }
};