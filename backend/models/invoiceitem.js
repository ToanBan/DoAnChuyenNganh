'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InvoiceItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
       InvoiceItem.belongsTo(models.Invoice, { foreignKey: 'invoice_id', as: 'Invoice' });
       InvoiceItem.belongsTo(models.Course, { as: "Course", foreignKey: "course_id" });

    }
  }
  InvoiceItem.init({
    invoice_id: DataTypes.INTEGER,
    course_id: DataTypes.INTEGER,
    course_name: DataTypes.STRING,
    price: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'InvoiceItem',
  });
  return InvoiceItem;
};