"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserForumTopicComment extends Model {
    static associate(models) {
      UserForumTopicComment.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
        onDelete: "CASCADE",
      });

      UserForumTopicComment.belongsTo(models.ForumTopic, {
        foreignKey: "forumTopic_id",
        as: "forumTopic",
        onDelete: "CASCADE",
      });
    }
  }

  UserForumTopicComment.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      forumTopic_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "UserForumTopicComment",
      tableName: "UserForumTopicComments",
      timestamps: true,
    }
  );

  return UserForumTopicComment;
};
