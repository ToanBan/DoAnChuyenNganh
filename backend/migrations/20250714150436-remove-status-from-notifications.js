'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Xóa cột 'status' khỏi bảng 'Notifications'
    await queryInterface.removeColumn('Notifications', 'status');
  },

  async down(queryInterface, Sequelize) {
    // Thêm lại cột 'status' nếu cần rollback
    await queryInterface.addColumn('Notifications', 'status', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  }
};
