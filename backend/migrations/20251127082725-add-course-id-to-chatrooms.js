'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('chatrooms', 'course_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'courses', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addIndex('chatrooms', ['student_id', 'teacher_id', 'course_id'], {
      unique: true,
      name: 'chatrooms_student_teacher_course_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('chatrooms', 'chatrooms_student_teacher_course_unique').catch(()=>{});
    await queryInterface.removeColumn('chatrooms', 'course_id');
  }
};