const mongo = require("mongodb");

const Review = require("../models/Review");
const Product = require("../models/Product");

exports.calculateAvgRatings = async (product_id) => {
  try {
    const product = await Product.findById(product_id);
    const reviews = await Review.aggregate([
      {
        $match: {
          product: mongo.ObjectId(product._id),
        },
      },
      {
        $group: {
          _id: "$_id",
          total_sum_ratings: { $sum: "$rating" },
          total_ratings: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          total_sum_ratings: 1,
          total_ratings: 1,
        },
      },
    ]);
    if (reviews && reviews[0])
      product.avgRatings =
        reviews[0].total_sum_ratings / reviews[0].total_ratings;
    else product.avgRatings = 0;
    await product.save();
  } catch (err) {
    console.log(err);
    return true;
  }
};

exports.ratingsBreakdown = async (product_id) => {
  try {
    const query = [
      {
        $match: {
          product: mongo.ObjectId(product_id),
        },
      },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
    ];
    const result = await Review.aggregate(query);
    const total = [
      {
        rating: 1,
        count: 0,
      },
      {
        rating: 2,
        count: 0,
      },
      {
        rating: 3,
        count: 0,
      },
      {
        rating: 4,
        count: 0,
      },
      {
        rating: 5,
        count: 0,
      },
    ];
    result.forEach((rating) => {
      if (rating) {
        total[rating._id - 1].count = rating.count;
      }
    });
    return total;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};
