"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Forum extends Model {
    static associate(models) {
      Forum.belongsToMany(models.User, {
        through: models.UserForum,
        foreignKey: "forumId",
        as: "users",
      });

      Forum.hasMany(models.ForumTopic, {
        foreignKey: "forum_id",
        as: "topics",
        onDelete: "CASCADE",
      });
    }
  }

  Forum.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "active",
      },
    },
    {
      sequelize,
      modelName: "Forum",
      tableName: "Forums",
      timestamps: true,
    }
  );

  return Forum;
};
