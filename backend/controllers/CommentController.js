const { Comment, User } = require("../models");
const jwt = require("jsonwebtoken");

const AddCommentController = async (io, socket, data) => {
  const { courseId, userId, content, parentId = null } = data;

  // if (!courseId || !userId || !content) {
  //   return socket.emit("comment_error", {
  //     message: "Thiếu thông tin bình luận!",
  //   });
  // }

  console.log(courseId, userId, content, parentId);

  try {
    const newComment = await Comment.create({
      course_id: courseId,
      user_id: userId,
      content,
      parent_id: parentId,
    });

    const user = await User.findByPk(userId, {
      attributes: ["id", "username", "avatar"],
    });

    if (!user) {
      return socket.emit("comment_error", {
        message: "Không tìm thấy người dùng!",
      });
    }

    io.emit("receive_comment", {
      id: newComment.id,
      courseId: newComment.course_id,
      userId: user.id,
      user: {
        username: user.username,
        avatar: user.avatar,
      },
      content: newComment.content,
      parent_id: newComment.parent_id,
      createdAt: newComment.created_at,
    });
  } catch (err) {
    console.error("Lỗi lưu bình luận:", err);
    socket.emit("comment_error", {
      message: "Lỗi khi lưu bình luận",
      error: err.message,
    });
  }
};


const GetCommentByCourseIdController = async (req, res) => {
  const { courseId } = req.params;
  try {
    const comments = await Comment.findAll({
      where: { course_id: courseId },
      order: [["created_at", "ASC"]],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "avatar"],
        },
      ],
    });
    return res.json({ message:comments });
  } catch (err) {
    console.error("Lỗi lấy bình luận:", err);
    return res
      .status(500)
      .json({ message: "Lỗi lấy bình luận", error: err.message });
  }
};

module.exports = { AddCommentController, GetCommentByCourseIdController };
