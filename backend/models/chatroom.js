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
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      teacher_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
     course_id: {
       type: DataTypes.INTEGER,
       allowNull: true,
      references: { model: 'courses', key: 'id' },
       onDelete: 'SET NULL',
       onUpdate: 'CASCADE'
      },
    },
    {
      sequelize,
      modelName: "ChatRoom",
      tableName: "chatrooms",
     indexes: [
       { unique: true, fields: ["student_id", "teacher_id", "course_id"], name: "chatrooms_student_teacher_course_unique" },
       { fields: ["teacher_id"] },
       { fields: ["student_id"] }
     ],
    }
  );

  return ChatRoom;
};
