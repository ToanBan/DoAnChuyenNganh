'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('QuestionTopicWeaks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      topic_weak_id: {
        type: Sequelize.INTEGER
      },
      question_text: {
        type: Sequelize.STRING
      },
      options: {
        type: Sequelize.JSON
      },
      correct_answer: {
        type: Sequelize.STRING
      },
      explanation: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('QuestionTopicWeaks');
  }
};