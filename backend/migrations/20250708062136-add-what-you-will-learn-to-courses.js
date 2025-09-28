'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("courses", "what_you_will_learn", {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: "Nội dung bạn sẽ học được từ khóa học này",
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
