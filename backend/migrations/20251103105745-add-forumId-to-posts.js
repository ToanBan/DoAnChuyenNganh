"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Posts", "forumId", {
      type: Sequelize.INTEGER,
      allowNull: true, // hoặc false nếu bài viết bắt buộc phải thuộc forum
      references: {
        model: "Forums", // tên bảng forum trong DB
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL", 
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Posts", "forumId");
  },
};
