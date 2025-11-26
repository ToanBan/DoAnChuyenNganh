// models/ChatRoom.js
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ChatRoom extends Model {
    static associate(models) {
  ChatRoom.belongsTo(models.User, { 
    as: "student", 
    foreignKey: "student_id" 
  });

  ChatRoom.belongsTo(models.User, { 
    as: "teacher", 
    foreignKey: "teacher_id" 
  });

  ChatRoom.hasMany(models.ChatMessage, {
    as: "messages",
    foreignKey: "room_id",
  });
}

  }

  ChatRoom.init(
    {
      student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ChatRoom",
      tableName: "chatrooms",
    }
  );

  return ChatRoom;
};
