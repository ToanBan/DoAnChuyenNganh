"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("QuizResults", {
      fields: ["user_id"],
      type: "foreign key",
      name: "fk_quizresult_user",
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    await queryInterface.addConstraint("QuizResults", {
      fields: ["topic_id"],
      type: "foreign key",
      name: "fk_quizresult_topic",
      references: {
        table: "Topics",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("QuizResults", "fk_quizresult_user");
    await queryInterface.removeConstraint("QuizResults", "fk_quizresult_topic");
  },
};
