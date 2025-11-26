// models/ChatMessage.js
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ChatMessage extends Model {
    static associate(models) {
      ChatMessage.belongsTo(models.ChatRoom, {
        foreignKey: "room_id",
        as: "room",
      });

      ChatMessage.belongsTo(models.User, {
        foreignKey: "sender_id",
        as: "sender",
      });

      ChatMessage.belongsTo(models.User, {
        foreignKey: "receiver_id",
        as: "receiver",
      });
    }
  }

  ChatMessage.init(
    {
      room_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      receiver_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "ChatMessage",
      tableName: "chatmessages",
    }
  );

  return ChatMessage;
};
