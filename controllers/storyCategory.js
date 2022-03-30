const moment = require("moment");

const Story = require("../models/Story");
const StoryCategory = require("../models/StoryCategory");

exports.add = async (req, res) => {
  try {
    const { name, status } = req.body;

    const story_category = new StoryCategory({
      name,
      status,
    });

    await story_category.save();

    await res.code(201).send({
      message: "Story Category Created",
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id, name, status } = req.body;
    const story_category = await StoryCategory.findById(id);
    story_category.name = name;
    story_category.status = status;

    await story_category.save();

    await res.code(201).send({
      message: "Story Category Updated",
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.logs = async (req, res) => {
  try {
    const searchParam = req.query.searchString
      ? {
          name: {
            $regex: `${req.query.searchString}`,
            $options: "i",
          },
        }
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

    const status_filter = req.query.status ? { status: req.query.status } : {};

    const logs = await StoryCategory.paginate(
      {
        ...dateFilter,
        ...searchParam,
        ...status_filter,
      },
      {
        page: req.query.page,
        limit: req.query.perPage,
        lean: true,
      }
    );

    await Promise.all(
      logs.docs.map(async (log) => {
        log.no_stories = await Story.find({ category: log._id })
          .select("_id")
          .countDocuments();
      })
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
    const category = await StoryCategory.findById(req.params.id);
    category.status = !category.status;

    await category.save();

    await res.code(201).send({
      message: category.status ? "Category Enabled" : "Category Disabled",
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.get = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await StoryCategory.findById(id).lean();

    await res.code(201).send({
      category,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};
