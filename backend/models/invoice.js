"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Invoice.hasMany(models.InvoiceItem, {
        foreignKey: "invoice_id",
        as: "InvoiceItems",
      });
      Invoice.belongsTo(models.User, { foreignKey: "user_id", as: "User" });
      Invoice.belongsTo(models.Cart, { foreignKey: "cart_id", as: "Cart" });
    }
  }
  Invoice.init(
    {
      user_id: DataTypes.INTEGER,
      cart_id: DataTypes.INTEGER,
      total: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Invoice",
    }
  );
  return Invoice;
};
