"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      // Một comment thuộc về một user
      Comment.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });

      Comment.belongsTo(models.Course, {
        foreignKey: "course_id",
        as: "course",
      });

      Comment.hasMany(models.Comment, {
        foreignKey: "parent_id",
        as: "replies",
      });

      // Một reply thuộc về một comment cha
      Comment.belongsTo(models.Comment, {
        foreignKey: "parent_id",
        as: "parent",
      });
    }
  }

  Comment.init(
    {
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Comment",
      tableName: "comments",
      timestamps: false, 
    }
  );

  return Comment;
};
