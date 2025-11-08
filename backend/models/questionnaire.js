"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Questionnaire extends Model {
    static associate(models) {
      Questionnaire.belongsTo(models.ForumTopic, {
        foreignKey: "forumTopicId",
        as: "forumTopic",
      });
    }
  }
  Questionnaire.init(
    {
      forumTopicId: DataTypes.INTEGER,
      question: DataTypes.TEXT,
      options: DataTypes.JSON,
      answer: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Questionnaire",
    }
  );
  return Questionnaire;
};
