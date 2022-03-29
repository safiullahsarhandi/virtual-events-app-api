const Story = require("../models/Story");
const { delete_file } = require("../services/delete_file");

exports.add = async (req, res) => {
  try {
    const { category, story_type, title, sub_title, description } = req.body;
    const cover_image =
      req.files &&
      req.files.cover_image &&
      req.files.cover_image[0] &&
      req.files.cover_image[0].path;
    const media =
      req.files &&
      req.files.media &&
      req.files.media[0] &&
      req.files.media[0].path;

    if (story_type !== "Textual" && !media)
      throw new Error("Please Select Media");

    const story = new Story({
      user: req.user.userId,
      category,
      story_type,
      title,
      sub_title,
      description,
      cover_image,
      media,
      status: true,
    });

    await story.save();

    await res.code(201).send({
      message: "Story Created",
    });
  } catch (err) {
    const cover_image =
      req.files &&
      req.files.cover_image &&
      req.files.cover_image[0] &&
      req.files.cover_image[0].path;
    const media =
      req.files &&
      req.files.media &&
      req.files.media[0] &&
      req.files.media[0].path;

    if (cover_image) delete_file(cover_image);
    if (media) delete_file(media);

    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.logs = async (req, res) => {
  try {
    const searchParam = req.query.searchString
      ? { title: { $regex: `${req.query.searchString}`, $options: "i" } }
      : {};
    const status_filter = req.query.status
      ? { status: JSON.parse(req.query.status) }
      : {};
    const user_filter = req.query.user ? { user: req.query.user } : {};
    const logs = await Story.paginate(
      {
        ...searchParam,
        ...status_filter,
        ...user_filter,
      },
      {
        page: req.query.page,
        limit: req.query.perPage,
        lean: true,
        sort: "-_id",
        select: "title story_type category status",
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
    const story = await Story.findById(req.params.id);
    story.status = !story.status;
    await story.save();
    await res.code(201).send({
      message: story.status ? "Story Activated" : "Story Deactivated",
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.storyDetails = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate({
        path: "user",
        select: "name phone auth user_image",
        populate: {
          path: "auth",
          select: "email",
        },
      })
      .populate({
        path: "category",
        select: "name",
      })
      .lean();

    await res.code(200).send({
      story,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};
