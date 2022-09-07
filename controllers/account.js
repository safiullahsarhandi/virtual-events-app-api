const { Types } = require("mongoose");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const { delete_file } = require("../services/delete_file");
const { generateHash } = require("../services/generate_hash");
const { comparePassword, verifyPassword } = require("../validations");

exports.index = async (req, res)=>{
    try {
        const user = await User.findById(req.user.userId)
          .populate([
            {
              path: "auth",
              select: "email",
            },
            {
              path : 'saved_cards',
              model: 'Card' 
            }
          ]);
        await res.code(200).send({
          user,
        });
      } catch (err) {
        console.log(err);
        res.code(500).send({ message: err.toString() });
      }
};


exports.update = async (req,res)=> {
  try {
    let {name,phone} = req.body;
    const user_image =
      req.files &&
      req.files.user_image &&
      req.files.user_image[0] &&
      req.files.user_image[0].path;
    let userImageData = user_image?{user_image} : {};
    
    let user = await User.findById(req.user.userId);
    if(user_image){
        await delete_file(user.user_image);
    }

    user.update({
      ...userImageData,
      phone,
      name,
    });
    res.code(200).send({
      message : 'account updated',
      status : true,
    });
  } catch (error) {
    console.log(error);
    res.code(500).send({
      message : error.toString(),
      status : false,
    });
  }
}



exports.mySubscriptions = async (req,res)=> {
  try {
    let {page,perPage,package_id,search} = req.query;
    let packageFilter = package_id?{'package._id' : Types.ObjectId(package_id)}:{};
    let searchFilter = search?{
      $or: [
        { 'package.name': { $regex: `${search}`, $options: "i" } },
      ],
    }:{};
    perPage = perPage || 10;
    
    const {docs : data, totalPages : total,pagingCounter : from} = await Subscription.paginate({
      ...packageFilter,
      ...searchFilter,
    },{
      page,
      limit : perPage,
      populate : ['package'],
    });

    return res.send({
      data,
      currentPage : page,
      total,
      from,
      perPage,
    });
  } catch (error) {
      console.log(error);
  }
}


exports.updatePassword = async (req,res)=> {
  try{
    let {password, current_password} = req.body;
    let user = await User.findById(req.user.userId);
    if(!verifyPassword(current_password, user.password)){
      res.code(422).send({
        message : 'invalid current password',
        status : false,
      });
    }
    
    await user.update({
      password: await generateHash(password),
    });      
    res.code(200).send({
      message : 'password changed',
      status : true,
    });
  }catch(error){
    console.log(error);

    res.code(500).send({
      message : error.toString(),
      status : false,
    });
  }
};