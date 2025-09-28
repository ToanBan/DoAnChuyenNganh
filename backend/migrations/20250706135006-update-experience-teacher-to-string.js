'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn("teachers", "experience_teacher", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null, // hoặc "" nếu muốn mặc định chuỗi rỗng
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
