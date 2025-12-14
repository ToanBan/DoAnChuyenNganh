'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1️⃣ Nối TopicWeak → Topic
    await queryInterface.addConstraint('TopicWeaks', {
      fields: ['topic_id'],
      type: 'foreign key',
      name: 'fk_topicweak_topic',
      references: {
        table: 'Topics', // tên bảng gốc
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // 2️⃣ Nối QuestionTopicWeak → TopicWeak
    await queryInterface.addConstraint('QuestionTopicWeaks', {
      fields: ['topic_weak_id'],
      type: 'foreign key',
      name: 'fk_questiontopicweak_topicweak',
      references: {
        table: 'TopicWeaks',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('QuestionTopicWeaks', 'fk_questiontopicweak_topicweak');
    await queryInterface.removeConstraint('TopicWeaks', 'fk_topicweak_topic');
  }
};
