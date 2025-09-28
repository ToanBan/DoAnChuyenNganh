const { where, or } = require("sequelize");
const { Notification, User } = require("../models");
const jwt = require("jsonwebtoken");
const CreateNotification = async (senderId, receiverId, type, message) => {
  await Notification.create({
    sender_id: senderId,
    receiver_id: receiverId,
    type,
    message,
  });
};

const GetNotificationController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Xác thực không thành công",
      });
    }
    const receiverId = decoded.id;
    const notifications = await Notification.findAll({
      where: { receiver_id: receiverId, is_read: false },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username", "email", "avatar"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["id", "username", "email", "avatar"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    const count = await Notification.count({
      where: {
        receiver_id: receiverId,
        is_read: false,
      },
    });

    return res.status(200).json({
      message: notifications,
      count,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const ReadedNotificationController = async (req, res) => {
  try {
    const { userId, type, notificationID } = req.body;
    // const notification = await Notification.findOne({where:{sender_id:userId, type}})
    const notification = await Notification.findOne({
      where: {
        id: notificationID,
      },
    });
    if (!notification) {
      return res.status(404).json({
        message: "Không Tìm Thấy",
      });
    }

    await Notification.update(
      { is_read: 1 },
      { where: {
        id:notificationID
      }}
    );

    return res.status(200).json({
      message: notification
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  CreateNotification,
  GetNotificationController,
  ReadedNotificationController,
};
