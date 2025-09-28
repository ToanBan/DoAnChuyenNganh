'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Certificates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      uid: {
        type: Sequelize.STRING
      },
      user_id: {
        type: Sequelize.BIGINT
      },
      course_id: {
        type: Sequelize.BIGINT
      },
      teacher_id: {
        type: Sequelize.BIGINT
      },
      pdf_path: {
        type: Sequelize.STRING
      },
      generated_at: {
        type: Sequelize.DATE
      },
      status: {
        type: Sequelize.STRING
      },
      note: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Certificates');
  }
};