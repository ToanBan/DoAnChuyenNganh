"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Questionnaires", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      forumTopicId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "ForumTopics",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      question: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      options: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: "Danh sách đáp án (ví dụ: ['A', 'B', 'C', 'D'])",
      },
      answer: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "Đáp án đúng",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Questionnaires");
  },
};
