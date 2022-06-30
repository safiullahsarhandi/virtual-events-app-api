const User = require("../models/User");

exports.index = async (req, res)=>{
    try {
        const user = await User.findById(req.user.userId)
          .populate({
            path: "auth",
            select: "email",
          });
        await res.code(200).send({
          user,
        });
      } catch (err) {
        console.log(err);
        res.code(500).send({ message: err.toString() });
      }
};