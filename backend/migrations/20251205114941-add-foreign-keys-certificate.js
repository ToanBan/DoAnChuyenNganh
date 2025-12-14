'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Nối Certificate → User
    await queryInterface.addConstraint('Certificates', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_certificate_user',
      references: {
        table: 'Users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Nối Certificate → Course
    await queryInterface.addConstraint('Certificates', {
      fields: ['course_id'],
      type: 'foreign key',
      name: 'fk_certificate_course',
      references: {
        table: 'Courses',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Nối Certificate → Teacher
    await queryInterface.addConstraint('Certificates', {
      fields: ['teacher_id'],
      type: 'foreign key',
      name: 'fk_certificate_teacher',
      references: {
        table: 'Teachers',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Certificates', 'fk_certificate_teacher');
    await queryInterface.removeConstraint('Certificates', 'fk_certificate_course');
    await queryInterface.removeConstraint('Certificates', 'fk_certificate_user');
  }
};
