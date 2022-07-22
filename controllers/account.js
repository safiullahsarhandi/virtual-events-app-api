const { Types } = require("mongoose");
const Subscription = require("../models/Subscription");
const User = require("../models/User");

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


exports.update = (req,res)=> {
  try {
    
  } catch (error) {
    console.log(error);
    res.code(500).send({
      message : error.toString(),
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