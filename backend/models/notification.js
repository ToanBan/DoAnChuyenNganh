'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Notification.belongsTo(models.User, { foreignKey: "receiver_id", as: "receiver" });
      Notification.belongsTo(models.User, { foreignKey: "sender_id", as: "sender" });
    }
  }
  Notification.init({
    sender_id: DataTypes.INTEGER,
    receiver_id: DataTypes.INTEGER,
    type: DataTypes.STRING,
    message: DataTypes.TEXT,
    is_read: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Notification',
  });
  return Notification;
};