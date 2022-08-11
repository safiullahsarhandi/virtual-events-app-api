const moment = require("moment");
const { Types } = require("mongoose");

const Product = require("../models/Product");
const Review = require("../models/Review");
const Wishlist = require("../models/Wishlist");
const { ratingsBreakdown } = require("../services/calculate_avg_ratings");

const { delete_file } = require("../services/delete_file");

exports.addProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      about_product,
      status,
      attributes: _attributes,
    } = req.body;
    const attributes = JSON.parse(_attributes);

    const images = [];

    const _images = req.files.product_image;
    if (!_images || _images.length === 0)
      throw new Error("Please Select Product Image");

    _images.forEach((image) => {
      images.push(image.path);
    });

    const product = new Product({
      name,
      category,
      price,
      about_product,
      status,
      attributes,
      images,
    });

    await product.save();

    await res.code(201).send({
      message: "Product Created",
    });
  } catch (err) {
    if (
      req.files &&
      req.files.product_image &&
      req.files.product_image.length > 0
    )
      req.files.product_image.forEach((image) => {
        delete_file(image.path);
      });

    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const {
      id,
      name,
      category,
      price,
      about_product,
      status,
      attributes: _attributes,
      existing_images: _existing_images,
    } = req.body;
    const attributes = JSON.parse(_attributes);
    const existing_images = JSON.parse(_existing_images);
    const images = [];

    const _images = req.files.product_image ? req.files.product_image : [];

    _images.forEach((image) => {
      images.push(image.path);
    });

    const product = await Product.findById(id);
    product.name = name;
    product.category = category;
    product.price = price;
    product.about_product = about_product;
    product.status = status;
    product.attributes = attributes;
    product.images = [...existing_images, ...images];

    await product.save();

    await res.code(201).send({
      message: "Product Updated",
    });
  } catch (err) {
    if (
      req.files &&
      req.files.product_image &&
      req.files.product_image.length > 0
    )
      req.files.product_image.forEach((image) => {
        delete_file(image.path);
      });

    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.logs = async (req, res) => {
  try {
    const searchParam = req.query.searchString
      ? { name: { $regex: `${req.query.searchString}`, $options: "i" } }
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
    const logs = await Product.paginate(
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
        select: "name price status createdAt",
        populate: {
          path: "category",
          select: "name",
        },
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

exports.changeStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    product.status = !product.status;
    await product.save();
    await res.code(201).send({
      message: product.status ? "Product Activated" : "Product Deactivated",
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.getProductDetails = async (req, res) => {
  try {
    // console.log(req.user);
    const product = await Product.findById(req.params.id).lean().populate([
      {
        path: "category",
        select: "name",
      },
      {
        path : 'total_ratings',
        model : 'Review',                                        
      },
      {
        path : 'isWishlist',
        model : 'Wishlist',
        match : {
          userId : Types.ObjectId(req.userId),
        },
      },
    ]);
    const ratings = await ratingsBreakdown(product._id);
    await res.code(200).send({
      product,
      ratings,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};


exports.getProducts = async (req,res)=> {
  
  let {page,limit} = req.query;
  page = page || 1;
  limit = limit || 10; 
  try {
    
    let {docs : data, pagingCounter : from, totalPages : total} = await Product.paginate({},
      {
      page,
      limit, 
      populate : {
        path : 'isWishlist',
        model : 'Wishlist',
        match : {
          userId : Types.ObjectId(req.user.userId),
        },
      },
    });
    
    res.code(200).send({
      data,
      currentPage : page,
      perPage : limit,
      from,
      total
    });

  } catch (error) {
      console.log(error);
  }
  
};



exports.updateWishlist = async (req,res)=> {
    let {id} = req.params;  
    let wishlist = await Wishlist.findOne({
      productId : id,
      userId : req.user.userId      
    });
    if(wishlist){
        await wishlist.delete();
    }else{      
        await Wishlist.create({
          productId : id,
          userId : req.user.userId,
        });
    }

    res.code(200).send({
      status : 200,
      message : 'wishlist updated',
    })
    
    

}

exports.getReviews = async (req,res)=> {
  try {
    let {id} = req.params;
    let {page} = req.query; 
    page = page || 1;
    let perPage = 10; 
    let {docs : data, totalPages : total, pagingCounter : from,} = await Review.paginate(
        {
          product : Types.ObjectId(id),
        },
        {
        page,
        limit : perPage,
        populate : ['user']
    });
    res.send({
      data,
      total,
      perPage : page,
      currentPage : page,
      from,
    });
  } catch (error) {
    
  }
};