'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('QuizAnswers', 'time_spent', {
      type: Sequelize.INTEGER, // hoặc Sequelize.FLOAT nếu muốn lưu thời gian decimal
      allowNull: true, // cho phép giá trị null
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('QuizAnswers', 'time_spent');
  }
};
