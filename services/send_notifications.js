const Notification = require("../models/Notification");

const SendNotification = async (data, session) => {
  try {
    const { message, to, userId, payload } = data;

    const notification = new Notification({
      message,
      to,
      userId,
      payload,
    });

    await notification.save(session);
    return notification._id;
  } catch (error) {
    console.log("error", error);
    throw new Error(error.toString());
  }
};

exports.registerUserNotification = async (user, session) => {
  await SendNotification(
    {
      message: `A New User Has Been Registered.`,
      to: "Admin",
      payload: {
        payloadType: "User",
        id: user._id,
      },
    },
    session
  );
};

exports.feedbackNotification = async (feedback, session) => {
  await SendNotification(
    {
      message: `There Are Few Querires Which Require Your Attention.`,
      to: "Admin",
      payload: {
        payloadType: "Feedback",
        id: feedback._id,
      },
    },
    session
  );
};

exports.sendOrderPlaceNotifications = async (order, session) => {
  await Promise.all([
    // SEND TO USER
    SendNotification(
      {
        message: `Order Successfully Placed. Order ID: ${order._id}`,
        to: "User",
        userId: order.user_id,
        payload: {
          payloadType: "Order",
          id: order._id,
        },
      },
      session
    ),
    // SEND TO ADMIN
    SendNotification(
      {
        message: `A New Order Has Been Placed. Order ID: ${order._id}`,
        to: "Admin",
        payload: {
          payloadType: "Order",
          id: order._id,
        },
      },
      session
    ),
  ]);
};

exports.updateOrderStatus = async (order, status, session) => {
  await Promise.all([
    // SEND TO USER
    SendNotification(
      {
        message: `Order Status Changed To ${status}. Order ID: ${order._id}`,
        to: "User",
        userId: order.user_id,
        payload: {
          payloadType: "Order",
          id: order._id,
        },
      },
      session
    ),
    // SEND TO ADMIN
    SendNotification(
      {
        message: `Order Status Chaged To ${status}. Order ID: ${order._id}`,
        to: "Admin",
        payload: {
          payloadType: "Order",
          id: order._id,
        },
      },
      session
    ),
  ]);
};

exports.reviewPosted = async (product, session) => {
  await Promise.all([
    // SEND TO ADMIN
    SendNotification(
      {
        message: `A New Review Has Been Posted For a Product`,
        to: "Admin",
        payload: {
          payloadType: "Review",
          id: product,
        },
      },
      session
    ),
  ]);
};

exports.reviewDeleted = async (product, session) => {
  await Promise.all([
    // SEND TO ADMIN
    SendNotification(
      {
        message: `A Review Posted Against An Order Has Been Deleted`,
        to: "Admin",
        payload: {
          payloadType: "Review",
          id: product,
        },
      },
      session
    ),
  ]);
};
