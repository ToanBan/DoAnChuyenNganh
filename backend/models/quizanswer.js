"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class QuizAnswer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      QuizAnswer.belongsTo(models.QuizResult, { foreignKey: "quiz_result_id" });
      QuizAnswer.belongsTo(models.Question, { foreignKey: "question_id" });
    }
  }
  QuizAnswer.init(
    {
      quiz_result_id: DataTypes.INTEGER,
      question_id: DataTypes.INTEGER,
      selected_option: DataTypes.STRING,
      is_correct: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "QuizAnswer",
    }
  );
  return QuizAnswer;
};
