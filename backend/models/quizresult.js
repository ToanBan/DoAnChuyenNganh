"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class QuizResult extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      QuizResult.hasMany(models.QuizAnswer, { foreignKey: "quiz_result_id" });
      QuizResult.belongsTo(models.Topic, { foreignKey: "topic_id" });
    }
  }
  QuizResult.init(
    {
      user_id: DataTypes.INTEGER,
      topic_id: DataTypes.INTEGER,
      score: DataTypes.FLOAT,
      correct_count: DataTypes.INTEGER,
      total_questions: DataTypes.INTEGER,
      attempt_number: DataTypes.INTEGER,
     
    },
    {
      sequelize,
      modelName: "QuizResult",
    }
  );
  return QuizResult;
};
