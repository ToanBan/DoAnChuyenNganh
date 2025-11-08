const { where } = require("sequelize");
const {
  sequelize,
  Forum,
  UserForum,
  ForumTopic,
  Questionnaire,
  Post,
  User,
  PostReaction,
} = require("../models");

const jwt = require("jsonwebtoken");
const AddForum = async () => {};

const JoinForum = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
      });
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
    const { forumId } = req.body;

    if (!forumId) {
      return res.status(400).json({
        message: "Not Found Forum",
      });
    }

    const isJoin = await UserForum.findOne({
      where:{
        userId, 
        forumId
      }
    })

    if(isJoin){
      return res.status(409).json({
        message:"User have already joined this forum"
      })
    }

    await UserForum.create({
      userId: userId,
      forumId: forumId,
    });

    return res.status(200).json({
      message: "Successfully joined forum",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const GetForumDetail = async (req, res) => {
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

    const { id } = req.params;

    const userForum = await UserForum.findOne({
      where: { userId: decoded.id, forumId: id },
      include: [
        {
          model: Forum,
          as: "forum",
          attributes: ["id", "name", "description", "createdAt", "tags"],
          include: [
            {
              model: ForumTopic,
              as: "topics",
              attributes: [
                "id",
                "title",
                "description",
                "type",
                "week",
                "createdAt",
              ],
              order: [["createdAt", "DESC"]],
              include: [
                {
                  model: Questionnaire,
                  as: "questionnaires", // alias trùng với bạn đã định nghĩa trong associate
                  attributes: ["id", "question", "options", "answer"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!userForum) {
      return res.status(404).json({ message: "Not Joined" });
    }

    return res.status(200).json({ message: userForum });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const GetPostForum = async (req, res) => {
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

    const { id } = req.params;
    const posts = await Post.findAll({
      where: {
        forumId: id,
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

    if (!posts) {
      return res.status(404).json({
        message: "not found",
      });
    }

    return res.status(200).json({
      message: posts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const JoinedForum = async (req, res) => {
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
    const forums = await UserForum.findAll({
      where: {
        userId: userId,
      },
      include: [
        {
          model: Forum,
          as: "forum",
        },
      ],
    });

    if (!forums) {
      return res.status(404).json({
        message: "Not Found",
      });
    }

    return res.status(200).json({
      message: forums,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const QuitForum = async (req, res) => {
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
    const forum = await UserForum.findOne({
      where: {
        userId: userId,
        forumId: id,
      },
    });

    if (!forum) {
      return res.status(404).json({
        message: "Not Found",
      });
    }

    await forum.destroy();
    return res.status(200).json({
      message: "Remove Successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  AddForum,
  JoinForum,
  GetForumDetail,
  GetPostForum,
  JoinedForum,
  QuitForum,
};
