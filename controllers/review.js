const Product = require("../models/Product");
const Review = require("../models/Review");
const { calculateAvgRatings } = require("../services/calculate_avg_ratings");

exports.createReview = async (req, res) => {
  const session = await Review.startSession();
  session.startTransaction();
  try {
    const opts = { session };
    const { rating, review, product } = req.body;

    const product_valid = await Product.exists({ _id: product });
    if (!product_valid) throw new Error("Invalid Product");

    const already_exists = await Review.exists({
      user: req.user.userId,
      product,
    });

    if (already_exists) throw new Error("Review Already Created");

    const review_doc = new Review({
      user: req.user.userId,
      review,
      rating: parseInt(rating),
      product,
    });

    await review_doc.save(opts);

    await session.commitTransaction();
    session.endSession();

    await res.code(201).send({
      message: "Review Created",
    });
    await calculateAvgRatings(product);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.editReview = async (req, res) => {
  try {
    const { id, rating, review } = req.body;

    const review_doc = await Review.findById(id);

    review_doc.review = review;
    review_doc.rating = parseInt(rating);

    await review_doc.save();

    await res.code(201).send({
      message: "Review Updated",
    });
    await calculateAvgRatings(review_doc.product);
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.deleteReview = async (req, res) => {
  const session = await Review.startSession();
  try {
    await session.withTransaction(async () => {
      const opts = { session };
      const { id } = req.params;
      const review = await Review.findById(id);
      if (!review) throw new Error("Review Not Found");

      req.user.scope.is_admin
        ? await Review.findByIdAndDelete(id).session(session)
        : await Review.findOneAndDelete({
            _id: id,
            user: req.user.userId,
          }).session(session);

      await session.commitTransaction();
      session.endSession();

      await res.code(201).send({
        message: "Review Deleted",
      });
      await calculateAvgRatings(review.product);
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.getMyProductReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      user: req.user.userId,
      product: req.params.id,
    })
      .lean()
      .populate("product");
    await res.code(200).send({
      review,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.reviewLogs = async (req, res) => {
  try {
    const logs = await Review.paginate(
      {},
      {
        page: req.query.page,
        limit: req.query.perPage,
        sort: "-_id",
        lean: true,
        populate: {
          path: "user_doc vendor product",
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

exports.reviewDetails = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate({
        path: "user_doc vendor product",
        select: "name",
      })
      .lean();

    await res.code(200).send({
      review,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.paginate(
      {
        product: req.params.id,
      },
      {
        page: req.query.page,
        limit: req.query.perPage,
        populate: {
          path: "user",
          select: "name user_image",
        },
        lean: true,
      }
    );

    await res.code(200).send({
      reviews,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};
