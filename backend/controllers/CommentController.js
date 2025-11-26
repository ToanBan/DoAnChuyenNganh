const { where } = require("sequelize");
const { Comment, User, CommentPost, UserForumTopic } = require("../models");
const jwt = require("jsonwebtoken");

const AddCommentController = async (io, socket, data) => {
  const { courseId, userId, content, parentId = null } = data;

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
    return res.json({ message: comments });
  } catch (err) {
    console.error("Lỗi lấy bình luận:", err);
    return res
      .status(500)
      .json({ message: "Lỗi lấy bình luận", error: err.message });
  }
};

const AddCommentPost = async (io, socket, data) => {
  try {
    const { postId, text, parentId = null } = data;
    const userId = socket.user.id;

    console.log("Thêm bình luận:", { postId, text, parentId, userId });

    const newComment = await CommentPost.create({
      postId,
      userId,
      content: text,
      parentId,
    });

    const user = await User.findByPk(userId, {
      attributes: ["id", "username", "avatar"],
    });

    io.to(`post-${postId}`).emit("receiveComment", {
      id: newComment.id,
      postId: newComment.postId,
      userId: user.id,
      User: {
        username: user.username,
        avatar: user.avatar,
      },
      content: newComment.content,
      parentId: newComment.parentId,
      createdAt: newComment.created_at,
    });
  } catch (error) {
    console.error("Lỗi lưu bình luận:", error);
    socket.emit("comment_error", {
      message: "Lỗi khi lưu bình luận",
      error: error.message,
    });
  }
};

const GetCommentByPostId = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await CommentPost.findAll({
      where: { postId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "avatar"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    return res.status(200).json({
      message: comments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const AddCommentForumTopic = async (io, socket, data) => {
  try {
    const { forumTopicId, content, parentId = null } = data;
    const userId = socket.user.id;

    console.log("Thêm bình luận:", { forumTopicId, content, parentId });

    const newComment = await UserForumTopic.create({
      forumTopicId,
      userId,
      content,
      parentId,
    });

    const user = await User.findByPk(userId, {
      attributes: ["id", "username", "avatar"],
    });

    io.to(`forumTopic-${forumTopicId}`).emit("receiveCommentForum", {
      id: newComment.id,
      forumTopicId: newComment.forumTopicId,
      userId: user.id,
      User: {
        username: user.username,
        avatar: user.avatar,
      },
      content: newComment.content,
      parentId: newComment.parentId,
      createdAt: newComment.created_at,
    });
  } catch (error) {
    console.error("Lỗi lưu bình luận:", error);
    socket.emit("comment_error", {
      message: "Lỗi khi lưu bình luận",
      error: error.message,
    });
  }
};

const GetCommentsForumTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await UserForumTopic.findAll({
      where: {
        forumTopicId: id,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "avatar"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    if(!comments){
      return res.status(404).json({
        message:"Not Found"
      })
    }
    return res.status(200).json({
      message:comments
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message:"Internal Server Error"
    })
  }
};

module.exports = {
  AddCommentController,
  GetCommentByCourseIdController,
  AddCommentPost,
  GetCommentByPostId,
  AddCommentForumTopic,
  GetCommentsForumTopic
};
