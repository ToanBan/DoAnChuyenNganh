const {
  Post,
  User,
  sequelize,
  Course,
  PostReaction,
  CommentPost,
} = require("../models");
const bcrypt = require("bcrypt");
const redisClient = require("../lib/redis");
const jwt = require("jsonwebtoken");
const { where, fn, col } = require("sequelize");
const path = require("path");
const fs = require("fs");
const { faker } = require("@faker-js/faker");
const { updateContentDataset } = require("./GetDatasetController");
const AddPost = async (req, res) => {
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

    const { post_title, forumId } = req.body;

    const filePath = req.file;
    let typeFile;
    let fileName;
    if (filePath) {
      const mimetype = filePath.mimetype.split("/")[0];
      typeFile = mimetype;
      fileName = filePath.filename;
    } else {
      typeFile = "none";
    }

    const post = await Post.create({
      userId: decoded.id,
      post_url: fileName,
      post_caption: post_title,
      forumId,
      type: typeFile,
    });

    if (post) {
      await updateContentDataset(post.id);
      return res.status(200).json({
        message: "Add Successfully",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server ",
    });
  }
};

const GetPost = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    } catch (err) {
      if (err.name === "TokenExpiredError")
        return res.status(401).json({ message: "Token expired" });
      return res.status(403).json({ message: "Invalid token" });
    }

    const posts = await Post.findAll({
      where: {
        forumId: null,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "avatar"],
        },
        {
          model: PostReaction,
          as: "reactions",
          attributes: ["id", "userId", "reactionType"],
        },
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM PostReactions AS pr
              WHERE pr.postId = Post.id
            )`),
            "reactionCount",
          ],
        ],
      },
      order: [["createdAt", "DESC"]],
    });

    if (!posts || posts.length === 0)
      return res.status(404).json({ message: "Not Found" });

    return res.status(200).json({ message: posts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const ToggleReaction = async (req, res) => {
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
    const { valueReaction, postId } = req.body;

    const existReaction = await PostReaction.findOne({
      where: { userId, postId },
    });

    let countReactions;

    if (existReaction) {
      if (existReaction.reactionType === valueReaction) {
        await existReaction.destroy();
        countReactions = await PostReaction.count({
          where: {
            postId,
          },
        });
        return res.status(200).json({ reactionType: null, countReactions });
      } else {
        existReaction.reactionType = valueReaction;
        countReactions = await PostReaction.count({
          where: {
            postId,
          },
        });
        await existReaction.save();
        return res
          .status(200)
          .json({ reactionType: existReaction.reactionType, countReactions });
      }
    } else {
      const newReaction = await PostReaction.create({
        userId,
        postId,
        reactionType: valueReaction,
      });

      countReactions = await PostReaction.count({
        where: {
          postId,
        },
      });
      return res
        .status(200)
        .json({ reactionType: newReaction.reactionType, countReactions });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      messagge: "Internal Server Error",
    });
  }
};

const GetCountLikeForPost = async (req, res) => {
  try {
    const { id } = req.params;
    const countReactions = await PostReaction.count({
      where: {
        postId: id,
      },
    });
    return res.status(200).json({
      message: countReactions,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const CheckDisplayReaction = async (req, res) => {
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
    const { id } = req.params;
    const existReaction = await PostReaction.findOne({
      where: {
        userId,
        postId: id,
      },
    });

    if (!existReaction) {
      return res.status(404).json({
        message: "No Reaction Post Id",
      });
    }

    return res.status(200).json({
      typeReaction: existReaction.reactionType,
      postId: existReaction.postId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const FakePostForUser = async () => {
  try {
    const postCount = await Post.count();
    if (postCount >= 1000) {
      console.log(`DB có ${postCount} post, không cần fake thêm.`);
      return;
    }
    const users = await User.findAll({
      attributes: ["id"],
      where: {
        role: "user",
      },
    });

    if (!users.length) {
      console.log("Chưa có user nào trong DB!");
      return;
    }
    const courses = await Course.findAll({ attributes: ["id", "course_name"] });
    if (!courses.length) {
      console.log("Chưa có khóa học nào trong DB!");
      return;
    }
    const postsToCreate = 1000 - postCount;
    for (let i = 0; i < postsToCreate; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomCourse = courses[Math.floor(Math.random() * courses.length)];
      const possibleSentences = [
        `Mình vừa học xong khóa học "${randomCourse.course_name}" và thấy nội dung rất hữu ích.`,
        `Có bạn nào học khóa học "${randomCourse.course_name}" cho mình xin ý kiến với`,
        `Các bạn cho mình hỏi khóa học "${randomCourse.course_name}" có quá khó không ạ`,
        `Khóa học này rất phù hợp cho người mới bắt đầu.`,
      ];
      const post_caption = faker.helpers.arrayElement(possibleSentences);
      // const response = await fetch("http://localhost:8000/generate-tags", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     name_course: "",
      //     description_course: post_caption,
      //   }),
      // });

      // const resTags = await response.json();
      // const tags = resTags.tags;
      await Post.create({
        userId: randomUser.id,
        post_url: null,
        post_caption: post_caption,
        // tags,
        type: "none",
      });
    }
    console.log(
      `Đã tạo ${postsToCreate} bài post giả liên quan khóa học với caption 3-4 câu.`
    );
  } catch (error) {
    console.error("Error khi fake dữ liệu:", error);
  }
};

const FakeUserReactionPosts = async () => {
  try {
    const users = await User.findAll({ attributes: ["id"] });
    const posts = await Post.findAll({ attributes: ["id", "userId"] });

    if (!users.length || !posts.length) {
      console.log("Không có User hoặc Post để fake reaction.");
      return;
    }

    for (const post of posts) {
      const reactionCount = Math.floor(Math.random() * 50);
      const usedUserIds = new Set();
      for (let i = 0; i < reactionCount; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        if (randomUser.id === post.userId || usedUserIds.has(randomUser.id)) {
          continue;
        }
        usedUserIds.add(randomUser.id);
        await PostReaction.create({
          userId: randomUser.id,
          postId: post.id,
          reactionType: "like",
        });
      }
    }
    console.log("Fake dữ liệu reaction thành công!");
  } catch (error) {
    console.error("Lỗi fake reaction:", error);
  }
};

const FakeUserCommentPost = async () => {
  try {
    const users = await User.findAll({ attributes: ["id"] });
    const posts = await Post.findAll({ attributes: ["id"] });

    if (!users.length || !posts.length) {
      console.log("Không có User hoặc Post để fake comment.");
      return;
    }

    const sampleComments = [
      "Bài viết hay quá!",
      "Tuyệt vời 🔥",
      "Wow, mình thích nội dung này.",
      "Cảm ơn vì đã chia sẻ!",
      "Hữu ích thật sự!",
      "Mình đồng ý với bạn.",
      "Quan điểm rất hay.",
      "Bài viết có tâm ghê 👍",
      "Nội dung sâu sắc.",
      "Rất ý nghĩa!",
    ];

    for (const post of posts) {
      const commentCount = Math.floor(Math.random() * 30);
      for (let i = 0; i < commentCount; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomContent =
          sampleComments[Math.floor(Math.random() * sampleComments.length)];
        await CommentPost.create({
          userId: randomUser.id,
          postId: post.id,
          parentId: null,
          content: randomContent,
        });
      }
    }

    console.log("Fake dữ liệu comment cho bài post thành công!");
  } catch (error) {
    console.error("Lỗi fake comment:", error);
  }
};

module.exports = {
  AddPost,
  GetPost,
  ToggleReaction,
  GetCountLikeForPost,
  CheckDisplayReaction,
  FakePostForUser,
  FakeUserReactionPosts,
  FakeUserCommentPost,
};
