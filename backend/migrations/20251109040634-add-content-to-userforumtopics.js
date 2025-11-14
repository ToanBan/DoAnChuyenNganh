'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('UserForumTopics', 'content', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'forumTopicId', // cột sẽ nằm sau forumTopicId (nếu DB hỗ trợ)
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('UserForumTopics', 'content');
  }
};
