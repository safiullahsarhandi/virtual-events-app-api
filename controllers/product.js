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
      sub_category,
      category,
      price,
      about_product,
      status,
      attributes: _attributes,
    } = req.body;
    const attributes = JSON.parse(_attributes);

    const images = [];

    const _images = req.files.filter(file => file.fieldname.includes('images'));
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
      sub_category,
    });

    await product.save();

    await res.code(201).send({
      message: "Product Created",
    });
  } catch (err) {
    const _images = req.files.filter(file => file.fieldname.includes('images'));
    if (
      req.files &&
      req.files.length > 0
      
    )
      _images.forEach((image) => {
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
        path: "sub_category",
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
  
  let {page,limit,parent,sub_category,rating,"categories[]" : categories} = req.query;
  page = page || 1;
  limit = limit || 10;
  rating = parseInt(rating);
  try {
    // if there is only one category passed in api convert it to array 
    categories = (typeof categories == 'string')?[categories]:categories;
    
    let categoryFilter = parent?{category : Types.ObjectId(parent)}:{};
    if((categories instanceof Array && categories.length > 0)){

      categories = categories.map((item)=> Types.ObjectId(item));
    }
    let subCategoriesFilter = (categories instanceof Array && categories.length > 0)?{sub_category : {$in : categories}}:(sub_category?{sub_category : {$in : [Types.ObjectId(sub_category)]}}:{});
    let aggregation = Product.aggregate()
    .match({
      ...categoryFilter,
      ...subCategoriesFilter,
    })
    .lookup({
      from : 'reviews',
      localField : '_id', 
      foreignField : 'product', 
      as : 'reviews',
    })
    .lookup({
      from : 'wishlists',
      localField : '_id', 
      foreignField : 'productId', 
      as : 'wishlists',
      pipeline : [
        {
          $match : {
            userId : Types.ObjectId(req.user.userId)
          },
        }
      ],
    })
    .addFields({
      avgRatings : {$round : [{ $avg : '$reviews.rating'},2]},
      isWishlist : { $convert : {input : {$size : '$wishlists'}, to : 'bool',onNull : false}}
    })
    
    .project({
      reviews : 0,
      wishlists : 0,
    });
    if(rating >= 0){
      aggregation = aggregation.match({
        avgRatings : {
          $gte : (rating || 0)
        }
      })
    }
    

    let {docs : data, pagingCounter : from, totalPages : total} = await Product.aggregatePaginate(aggregation,{
      page,
      limit, 
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

exports.getWishlists = async (req,res)=> {
    try {
      let {page:currentPage} = req.query;
      currentPage = currentPage || 1;
      let {docs : data, page,totalPages : total} = await Wishlist.paginate({
        userId : Types.ObjectId(req.user.userId)
      },{
        page : currentPage,
        populate : ['product'],
      });
      res.send({
        data,
        page,
        total,
      });
    } catch (error) {
      console.log(error);
    }
};

exports.truncateWishlist = async (req,res)=> {
    try {
        await Wishlist.deleteMany({
          userId : Types.ObjectId(req.user.userId),
        });
        res.code(200).send({
          message : 'wishlist has been cleared',
          status : true,
        });
    } catch (error) {
        res.code(500).send({
            message : 'internal server error',
            status : false,
            meta : error.toString(),
        })
    }
};

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

exports.getUserReviews = async (req,res)=> {
  try {
    let id = req.user.userId;
    let {page} = req.query; 
    page = page || 1;
    let perPage = 10; 
    let {docs : data, totalPages : total, pagingCounter : from,} = await Review.paginate(
        {
          userId : Types.ObjectId(id),
        },
        {
        populate : ['product'],
        page,
        limit : perPage,
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