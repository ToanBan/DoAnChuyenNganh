"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Topic extends Model {
    static associate(models) {
      Topic.belongsTo(models.Course, {
        foreignKey: "course_id",
        as: "course",
      });
      Topic.hasMany(models.Video, {
        foreignKey: "topic_id",
        as: "videos",
      });
      Topic.hasMany(models.Question, {
        foreignKey: "topic_id",
        as: "questions",
      });

      Topic.hasMany(models.Lecture, {
        foreignKey: "topic_id",
        as: "lectures",
      });

      Topic.hasMany(models.UserTopicProgress, {
        foreignKey: "topic_id",
        as: "progresses",
      });
    }
  }
  Topic.init(
    {
      topic_name: DataTypes.STRING,
      topic_description: DataTypes.TEXT,
      course_id: DataTypes.INTEGER,
      tags: {
        type: DataTypes.JSON, // hoặc DataTypes.TEXT nếu bạn dùng TEXT
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Topic",
    }
  );
  return Topic;
};
