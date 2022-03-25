const bcrypt = require("bcryptjs");

const Auth = require("../models/Auth");
const Admin = require("../models/Admin");
const { delete_file } = require("../services/delete_file");

exports.me = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.userId)
      .populate({
        path: "auth",
        select: "email",
      })
      .lean();
    await res.code(200).send({
      admin,
    });
  } catch (err) {
    console.log(err);
    res.code(500).send({ message: err.toString() });
  }
};

exports.editProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const new_user_image =
      req.files &&
      req.files.user_image &&
      req.files.user_image[0] &&
      req.files.user_image[0].path;

    if (!name) throw new Error("Name Is Required");

    const admin = await Admin.findById(req.user.userId).populate({
      path: "auth",
      select: "email",
    });
    const image_to_delete = admin.user_image;
    admin.name = name;

    if (new_user_image) admin.user_image = new_user_image;

    await admin.save();
    await res.code(200).send({
      admin,
    });
    if (new_user_image) delete_file(image_to_delete);
  } catch (err) {
    res.code(500).send({ message: err.toString() });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { password, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      return res.code(422).send({
        message: "Password Doesn't Match",
      });
    }
    const user = await Auth.findOne({ user: req.user.userId });
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      return res.code(422).send({
        message: "Invalid Password",
      });
    }
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    await res.code(201).send({
      message: "Password Updated",
    });
  } catch (err) {
    res.code(500).send({ message: err.toString() });
  }
};
