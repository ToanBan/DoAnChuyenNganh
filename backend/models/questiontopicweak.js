'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class QuestionTopicWeak extends Model {
  
    static associate(models) {
      // define association here
    }
  }
  QuestionTopicWeak.init({
    topic_weak_id: DataTypes.INTEGER,
    question_text: DataTypes.STRING,
    options: DataTypes.JSON,
    correct_answer: DataTypes.STRING,
    explanation: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'QuestionTopicWeak',
  });
  return QuestionTopicWeak;
};