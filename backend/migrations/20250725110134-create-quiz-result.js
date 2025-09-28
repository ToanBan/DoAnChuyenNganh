'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('QuizResults', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      topic_id: {
        type: Sequelize.INTEGER
      },
      score: {
        type: Sequelize.FLOAT
      },
      correct_count: {
        type: Sequelize.INTEGER
      },
      total_questions: {
        type: Sequelize.INTEGER
      },
      attempt_number: {
        type: Sequelize.INTEGER
      },
      used_for_certificate: {
        type: Sequelize.BOOLEAN
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
    await queryInterface.dropTable('QuizResults');
  }
};