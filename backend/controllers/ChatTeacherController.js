const { where } = require("sequelize");
const {
  Teacher,
  User,
  ChatRoom,
  ChatMessage,
  Course,
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
    const { teacherId, courseId } = data || {};
    const userId = socket.user?.id;
    console.log("InitChatTeacher payload:", { teacherId, courseId, userId });

    if (!teacherId || !userId || !courseId) {
      const errObj = { message: "Thiếu teacherId / userId / courseId", payload: data };
      console.error("InitChatTeacher validation error:", errObj);
      return socket.emit("chat_error", errObj);
    }

    const room = await CreateOrGetChatRoom(teacherId, userId, courseId);
    socket.emit("initChatTeacherCallback", room.id);
  } catch (error) {
    console.error("InitChatTeacher exception:", error);
    socket.emit("chat_error", {
      message: "Lỗi khi khởi tạo chat",
      error: String(error?.message || error),
      stack: error?.stack,
      payload: data,
    });
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
    const { roomId, content } = data || {};
    if (!roomId || !content) {
      return socket.emit("chat_error", { message: "Missing roomId or content" });
    }

    const senderUserId = socket.user?.id;
    if (!senderUserId) return socket.emit("chat_error", { message: "Unauthorized" });

    const room = await ChatRoom.findByPk(roomId);
    if (!room) return socket.emit("chat_error", { message: "Room not found" });

    const studentUserId = room.student_id; 
    let teacherUserId = null;
    if (room.teacher_id) {
      const teacher = await Teacher.findByPk(room.teacher_id);
      teacherUserId = teacher ? teacher.user_id : null; 
    }

    const receiverUserId = String(senderUserId) === String(teacherUserId) ? studentUserId : teacherUserId;

    const saved = await ChatMessage.create({
      room_id: roomId,
      sender_id: senderUserId,    
      receiver_id: receiverUserId,
      content,
    });

    const payload = {
      id: saved.id,
      roomId: saved.room_id,
      content: saved.content,
      senderId: senderUserId,     
      receiverId: receiverUserId,
      createdAt: saved.createdAt,
    };

    io.in(`chatroom_${roomId}`).emit("receiveChatMessage", payload);
  } catch (err) {
    console.error("SendMessage error:", err);
    socket.emit("chat_error", { message: "Send message failed" });
  }
};

const GetTeacherChatRooms = async (req, res) => {
  try {
    const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.startsWith("Bearer ") ? req.headers.authorization.slice(7) : null);
    if (!token) return res.status(401).json({ message: "Không tìm thấy token" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    } catch (e) {
      return res.status(401).json({ message: "Xác thực thất bại" });
    }

    const userId = decoded.id;
    // Lấy teacher tương ứng
    const teacher = await Teacher.findOne({ where: { user_id: userId } });
    if (!teacher) return res.status(404).json({ message: "Không tìm thấy giáo viên" });

    const teacherId = teacher.id;

    // Lấy chatrooms của teacher (ORM)
    const rooms = await ChatRoom.findAll({
      where: { teacher_id: teacherId },
      order: [["updatedAt", "DESC"]],
    });

    const studentIds = [...new Set(rooms.map((r) => r.student_id).filter(Boolean))];
    const courseIds = [...new Set(rooms.map((r) => r.course_id).filter(Boolean))];

    const users = studentIds.length
      ? await User.findAll({ where: { id: studentIds }, attributes: ["id", "username", "email", "phone", "avatar"] })
      : [];
    const courses = courseIds.length
      ? await Course.findAll({ where: { id: courseIds }, attributes: ["id", "course_name"] })
      : [];

    const userMap = new Map(users.map((u) => [u.id, u]));
    const courseMap = new Map(courses.map((c) => [c.id, c]));

    const payload = rooms.map((r) => ({
      id: r.id,
      student: {
        id: r.student_id,
        username: userMap.get(r.student_id)?.username ?? "",
        email: userMap.get(r.student_id)?.email ?? "",
        phone: userMap.get(r.student_id)?.phone ?? "",
        avatar: userMap.get(r.student_id)?.avatar ?? null,
      },
      course: r.course_id ? { id: r.course_id, course_name: courseMap.get(r.course_id)?.course_name ?? "" } : null,
      updatedAt: r.updatedAt,
    }));

    return res.status(200).json({ rooms: payload });
  } catch (error) {
    console.error("GetTeacherChatRooms error:", error);
    return res.status(500).json({ message: "Server error", error: String(error) });
  }
};



module.exports = {
  InitChatTeacher,
  GetMessagesByRoomId,
  SendMessage,
  GetTeacherChatRooms,
};