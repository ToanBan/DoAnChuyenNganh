"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ForumTopic extends Model {
    static associate(models) {
      ForumTopic.belongsTo(models.Forum, {
        foreignKey: "forum_id",
        as: "forum",
        onDelete: "CASCADE",
      });

      ForumTopic.hasMany(models.Questionnaire, {
        foreignKey: "forumTopicId",
        as: "questionnaires",
        onDelete: "CASCADE",
      });
    }
  }

  ForumTopic.init(
    {
      forum_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM("discussion", "quiz"),
        allowNull: false,
      },
      week: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "ForumTopic",
      tableName: "ForumTopics",
      timestamps: true,
    }
  );

  return ForumTopic;
};
