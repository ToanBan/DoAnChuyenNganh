'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      // Nếu muốn thêm quan hệ với Teacher/Student
      Message.belongsTo(models.User, { as: 'sender', foreignKey: 'senderId' });
      Message.belongsTo(models.User, { as: 'receiver', foreignKey: 'receiverId' });
    }
  }
  Message.init(
    {
      senderId: { type: DataTypes.INTEGER, allowNull: false },
      senderType: { type: DataTypes.ENUM('teacher', 'student'), allowNull: false },
      receiverId: { type: DataTypes.INTEGER, allowNull: false },
      receiverType: { type: DataTypes.ENUM('teacher', 'student'), allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: false },
    },
    {
      sequelize,
      modelName: 'Message',
    }
  );
  return Message;
};
