"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Question.belongsTo(models.Topic, {
        foreignKey: "topic_id",
        as: "topic",
      });
    }
  }
  Question.init(
    {
      topic_id: DataTypes.INTEGER,
      question_text: DataTypes.TEXT,
      options: DataTypes.JSON,
      correct_answer: DataTypes.STRING,
      explanation: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Question",
    }
  );
  return Question;
};
