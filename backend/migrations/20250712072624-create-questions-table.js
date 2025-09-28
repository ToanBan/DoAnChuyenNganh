"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("questions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      topic_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "topics",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      question_text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      options: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: "Danh sách các lựa chọn trắc nghiệm",
      },
      correct_answer: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "Đáp án đúng (ví dụ: 'A', 'B', 'C', 'D')",
      },
      explanation: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Giải thích đáp án đúng",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
