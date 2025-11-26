const { where } = require("sequelize");
const {
  Teacher,
  User,
  ChatRoom,
  ChatMessage,
} = require("../models");
const jwt = require("jsonwebtoken");

const CreateOrGetChatRoom = async (teacherId, userId, courseId) => {
  let room = await ChatRoom.findOne({
    where: { teacher_id: teacherId, student_id: userId, course_id: courseId },
  });

  if (!room) {
    room = await ChatRoom.create({
      teacher_id: teacherId,
      student_id: userId,
      course_id: courseId,
    });
  }

  return room;
};

const InitChatTeacher = async (io, socket, data) => {
  try {
    const { teacherId, courseId } = data;
    const userId = socket.user.id;

    const room = await CreateOrGetChatRoom(teacherId, userId, courseId);

    socket.emit("initChatTeacherCallback", room.id);
  } catch (error) {
    console.error("Lỗi init chat teacher:", error);
    socket.emit("chat_error", { message: "Lỗi khi khởi tạo chat", error: error.message });
  }
};

const GetMessagesByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await ChatMessage.findAll({
      where: { room_id: roomId },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username", "avatar"],
        },
      ],
      order: [["created_at", "ASC"]],
    });

    return res.status(200).json({ messages });
  } catch (error) {
    console.error("Lỗi lấy tin nhắn:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const SendMessage = async (io, socket, data) => {
  try {
    const { roomId, content } = data;
    const senderId = socket.user.id;

    if (!roomId || !content) {
      return socket.emit("chat_error", { message: "Thiếu thông tin gửi tin nhắn!" });
    }

    // Lấy thông tin room để biết receiver
    const room = await ChatRoom.findByPk(roomId);
    if (!room) {
      return socket.emit("chat_error", { message: "Room không tồn tại!" });
    }

    // Xác định receiver_id (nếu sender là student thì receiver là teacher và ngược lại)
    const receiverId = senderId === room.student_id ? room.teacher_id : room.student_id;

    const message = await ChatMessage.create({
      room_id: roomId,
      sender_id: senderId,
      receiver_id: receiverId,
      message: content, 
    });

    const payload = {
      id: message.id,
      roomId: message.room_id,
      senderId: message.sender_id,
      sender: senderId === room.teacher_id ? "teacher" : "user",
      content: message.message,
      createdAt: message.createdAt,
    };

    io.to(`chatroom_${roomId}`).emit("receiveChatMessage", payload);
  } catch (error) {
    console.error("Lỗi gửi tin nhắn:", error);
    socket.emit("chat_error", { message: "Lỗi gửi tin nhắn", error: error.message });
  }
};

module.exports = {
  InitChatTeacher,
  GetMessagesByRoomId,
  SendMessage,
};