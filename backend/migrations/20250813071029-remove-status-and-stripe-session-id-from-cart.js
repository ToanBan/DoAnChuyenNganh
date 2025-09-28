'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Carts', 'status');
    await queryInterface.removeColumn('Carts', 'stripe_session_id');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Carts', 'status', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Carts', 'stripe_session_id', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};
