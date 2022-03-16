const moment = require("moment");

const Auth = require("../models/Auth");
const Reset = require("../models/Reset");
const Notification = require("../models/Notification");

exports.getUserForAuth = async (email) =>
  await Auth.findOne({ email: email.toLowerCase() }).populate("admin_auth");

exports.updatePassword = async (user, updated_data) =>
  await Auth.findByIdAndUpdate(user, updated_data);

exports.createResetToken = async (email, code) => {
  const token = await Reset.findOne({ email });
  if (token) await token.remove();
  const newToken = new Reset({
    email,
    code,
  });
  await newToken.save();
};

exports.validateCode = async (code, email) =>
  await Reset.findOne({ code, email });

exports.getNotificationCount = async (is_admin, user) => {
  const user_filter = user ? { userId: user } : {};
  const admin_filter = is_admin ? { to: "Admin" } : {};
  const count = await Notification.find({
    ...user_filter,
    ...admin_filter,
    read: false,
  }).countDocuments();
  return count;
};
