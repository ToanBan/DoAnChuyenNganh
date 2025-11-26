"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      // Mỗi Post thuộc về 1 User
      Post.belongsTo(models.User, { foreignKey: "userId", as: "user" });
      Post.hasMany(models.CommentPost, {
        foreignKey: "postId",
        as: "comments",
      });
      Post.hasMany(models.PostReaction, {
        foreignKey: "postId",
        as: "reactions",
      });
    }
  }

  Post.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      post_url: DataTypes.STRING,
      post_caption: DataTypes.TEXT,
      type: {
        type: DataTypes.ENUM("image", "video", "none"),
        allowNull: true,
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      forumId:{
        type:DataTypes.STRING, 
        allowNull:true
      },
      posts_like: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Post",
      tableName: "Posts",
    }
  );

  return Post;
};