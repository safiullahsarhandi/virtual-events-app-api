const Auth = require("../models/Auth");
const User = require("../models/User");
const Admin = require("../models/Admin");

const { generateEmail } = require("../services/generate_email");
const { generateHash } = require("../services/generate_hash");
const { generateToken } = require("../services/generate_token");
const { generateCode } = require("../services/generate_code");
const {
  userExists,
  validateEmail,
  verifyPassword,
  comparePassword,
} = require("../validations");
const {
  validateCode,
  getUserForAuth,
  createResetToken,
  getUserForProfile,
} = require("../queries");
const { delete_file } = require("../services/delete_file");

// @ADMIN APIs
exports.registerAdmin = async (req, res) => {
  const session = await Auth.startSession();
  session.startTransaction();
  try {
    const opts = { session };
    const { name, email: _email, password } = req.body;
    const email = validateEmail(_email);

    if (!email) throw new Error("Invalid Email Address");

    if (await userExists(email)) throw new Error("Email Already Registered");

    const user_image =
      req.files &&
      req.files.user_image &&
      req.files.user_image[0] &&
      req.files.user_image[0].path;

    const auth = new Auth({
      email,
      password: await generateHash(password),
    });

    const admin = new Admin({
      name,
      auth: auth._id,
      user_image,
    });

    auth.user = admin._id;

    await admin.save(opts);
    await auth.save(opts);

    await session.commitTransaction(opts);
    session.endSession(opts);

    await res.code(201).send({
      message: "Admin Created",
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    const user_image =
      req.files &&
      req.files.user_image &&
      req.files.user_image[0] &&
      req.files.user_image[0].path;
    if (user_image) delete_file(user_image);
    console.log(err);
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password, remember_me } = req.body;
    const admin = await getUserForAuth(email);
    if (!admin) throw new Error("Invlaid Email/Password");
    const isEqual = await verifyPassword(password, admin.password);
    if (!isEqual) throw new Error("Invlaid Email/Password");
    const token = await generateToken(
      admin.email,
      admin.admin_auth._id,
      process.env.JWT_SECRET,
      { is_admin: true },
      { expiresIn: remember_me ? "365d" : "14400000" }
    );
    await res.code(200).send({
      message: "Admin Logged In",
      token,
    });
  } catch (err) {
    console.log(err);
    res.code(500).send({
      message: err.toString(),
    });
  }
};

// @USER APIs
exports.registerUser = async (req, res) => {
  const session = await Auth.startSession();
  session.startTransaction();
  try {
    const opts = { session };
    const { name, email: _email, password, phone } = req.body;
    const email = validateEmail(_email);

    if (!email) throw new Error("Invalid Email Address");

    if (await userExists(email)) throw new Error("Email Already Registered");

    const user_image =
      req.files &&
      req.files.user_image &&
      req.files.user_image[0] &&
      req.files.user_image[0].path;

    const auth = new Auth({
      email,
      password: await generateHash(password),
    });

    const user = new User({
      name,
      phone,
      auth: auth._id,
      user_image,
      status: true,
    });

    auth.user = user._id;

    await user.save(opts);
    await auth.save(opts);

    await session.commitTransaction(opts);
    session.endSession(opts);

    await res.code(201).send({
      message: "Registered Successfully",
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    const user_image =
      req.files &&
      req.files.user_image &&
      req.files.user_image[0] &&
      req.files.user_image[0].path;
    if (user_image) delete_file(user_image);
    console.log(err);
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await getUserForAuth(email);
    if (!user) throw new Error("Invlaid Email/Password");
    const isEqual = await verifyPassword(password, user.password);
    if (!isEqual) throw new Error("Invlaid Email/Password");
    const token = await generateToken(
      user.email,
      user.user_auth._id,
      process.env.JWT_SECRET,
      { is_user: true }
    );
    await res.code(200).send({
      message: "User Logged In",
      token,
      user: await getUserForProfile(user.user_auth._id),
    });
  } catch (err) {
    console.log(err);
    res.code(500).send({
      message: err.toString(),
    });
  }
};

// @GENERAL APIs
exports.recoverPassword = async (req, res) => {
  try {
    const { email: _email } = req.body;
    const email = validateEmail(_email);
    if (!email) throw new Error("Invlaid Email/Password");
    const user = await getUserForAuth(email);
    if (!user) throw new Error("Invlaid Email/Password");
    const status = generateCode();
    await createResetToken(email, status);
    const html = `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.
    \n\n Your verification status is ${status}:\n\n
    \n\n If you did not request this, please ignore this email and your password will remain unchanged.           
    </p>`;
    await generateEmail(email, "Could You Tell - Password Reset", html);
    return res.code(201).send({
      message:
        "Recovery Code Has Been Emailed To Your Registered Email Address",
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.verifyRecoverCode = async (req, res) => {
  try {
    const { code, email: _email } = req.body;
    const email = validateEmail(_email);
    if (!email) throw new Error("Invalid Email Address");
    if (await validateCode(code, email))
      return res.code(200).send({ message: "Recovery Code Accepted" });
    else throw new Error("Invalid Recovery Code");
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password, confirm_password, code, email: _email } = req.body;
    const email = validateEmail(_email);
    if (!email) throw new Error("Invalid Email Address");
    if (!comparePassword(password, confirm_password))
      throw new Error("Password Doesn't Match");
    const reset_status = await validateCode(code, email);
    if (!reset_status) throw new Error("Recovery Code is Invalid");
    const user = await getUserForAuth(email);
    user.password = await generateHash(password);
    await user.save();
    await res.code(201).send({
      message: "Password Updated",
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};
