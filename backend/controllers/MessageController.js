const { where, Op} = require("sequelize");
const { User, Message, Teacher } = require("../models");
const jwt = require("jsonwebtoken");

const SendMessage = async (io, socket, data) => {
  try {
    const { recieveId, content } = data;
    let finalReceiverId;
    let senderType;
    let receiverType;
    let userId = socket.user.id;

    const isCheckTeacher = await Teacher.findOne({
      where: {
        id: recieveId,
        status: 1,
      },
    });

    if (isCheckTeacher) {
      senderType = "student";
      receiverType = "teacher";
      finalReceiverId = isCheckTeacher.user_id;
    } else {
      senderType = "teacher";
      receiverType = "student";
      finalReceiverId = recieveId;
    }

    const newMessage = await Message.create({
      senderId: userId,
      receiverId: finalReceiverId,
      content,
      senderType,
      receiverType,
    });

    console.log(userId, finalReceiverId);

    io.to(`user-${finalReceiverId}`).emit("receiveMessage", {
      id: newMessage.id,
      senderId: newMessage.senderId,
      receiverId: newMessage.receiverId,
      content: newMessage.content,
      createdAt: newMessage.createdAt,
      senderType: newMessage.senderType,
      receiverType: newMessage.receiverType,
    });

    io.to(`user-${userId}`).emit("receiveMessage", {
      id: newMessage.id,
      senderId: newMessage.senderId,
      receiverId: newMessage.receiverId,
      content: newMessage.content,
      createdAt: newMessage.createdAt,
      senderType: newMessage.senderType,
      receiverType: newMessage.receiverType,
    });
  } catch (error) {
    console.error("Lỗi gửi tin nhắn:", error);
    socket.emit("message_error", {
      message: "Lỗi khi gửi tin nhắn",
      error: error.message,
    });
  }
};

const GetMessageByUserId = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN,
      (err, decoded) => {
        if (err) {
          if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
          }
          return res.status(403).json({ message: "Invalid token" });
        }
        return decoded;
      }
    );

    const userId = decoded.id;
    let finalReceiverId;
    const { id } = req.params;
    const teacher = await Teacher.findOne({
      where:{
        id
      }
    })

    teacher ? finalReceiverId = teacher.user_id : finalReceiverId = id;
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: finalReceiverId },
          { senderId: finalReceiverId, receiverId: userId },
        ],
      },
      order: [["createdAt", "ASC"]],
    });
    return res.status(200).json({
      message:messages
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { SendMessage, GetMessageByUserId };
