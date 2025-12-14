'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Xóa cột user_id
    await queryInterface.removeColumn('TopicWeaks', 'user_id');
  },

  async down(queryInterface, Sequelize) {
    // Nếu rollback, thêm lại cột user_id
    await queryInterface.addColumn('TopicWeaks', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  }
};
