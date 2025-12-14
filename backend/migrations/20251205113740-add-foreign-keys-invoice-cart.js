'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('InvoiceItems', {
      fields: ['invoice_id'],
      type: 'foreign key',
      name: 'fk_invoiceitems_invoice',
      references: {
        table: 'Invoices',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('InvoiceItems', {
      fields: ['course_id'],
      type: 'foreign key',
      name: 'fk_invoiceitems_course',
      references: {
        table: 'Courses',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Invoice -> User
    await queryInterface.addConstraint('Invoices', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_invoices_user',
      references: {
        table: 'Users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Invoice -> Cart
    await queryInterface.addConstraint('Invoices', {
      fields: ['cart_id'],
      type: 'foreign key',
      name: 'fk_invoices_cart',
      references: {
        table: 'Carts',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // CartItem -> Cart
    await queryInterface.addConstraint('CartItems', {
      fields: ['cart_id'],
      type: 'foreign key',
      name: 'fk_cartitems_cart',
      references: {
        table: 'Carts',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // CartItem -> Course
    await queryInterface.addConstraint('CartItems', {
      fields: ['course_id'],
      type: 'foreign key',
      name: 'fk_cartitems_course',
      references: {
        table: 'Courses',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Cart -> User
    await queryInterface.addConstraint('Carts', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_carts_user',
      references: {
        table: 'Users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

   
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('InvoiceItems', 'fk_invoiceitems_invoice');
    await queryInterface.removeConstraint('InvoiceItems', 'fk_invoiceitems_course');
    await queryInterface.removeConstraint('Invoices', 'fk_invoices_user');
    await queryInterface.removeConstraint('Invoices', 'fk_invoices_cart');
    await queryInterface.removeConstraint('CartItems', 'fk_cartitems_cart');
    await queryInterface.removeConstraint('CartItems', 'fk_cartitems_course');
    await queryInterface.removeConstraint('Carts', 'fk_carts_user');
    await queryInterface.removeConstraint('Courses', 'fk_courses_teacher');
  }
};
