const Notification = require("../models/Notification");
const { getNotificationCount } = require("../queries");

exports.getNotificationAdmin = async (req, res) => {
  try {
    const notifications = await Notification.paginate(
      {
        to: "Admin",
      },
      {
        page: req.query.page,
        limit: req.query.perPage,
        lean: true,
        sort: "-_id",
      }
    );
    await res.code(200).send({
      notifications,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.getNotificationCount = async (req, res) => {
  try {
    const count = await getNotificationCount(true);
    res.code(200).send({
      count,
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};

exports.readNotification = async (req, res) => {
  try {
    req.user.scope.is_admin
      ? await Notification.updateOne({ _id: req.params.id }, { read: true })
      : await Notification.updateOne(
          { _id: req.params.id, userId: req.user.userId },
          { read: true }
        );
    await res.code(200).send({
      message: "OK",
    });
  } catch (err) {
    res.code(500).send({
      message: err.toString(),
    });
  }
};
