"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserForum extends Model {
    static associate(models) {
      UserForum.belongsTo(models.User, { foreignKey: "userId", as: "user" });
      UserForum.belongsTo(models.Forum, { foreignKey: "forumId", as: "forum" });
    }
  }

  UserForum.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      forumId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "UserForum",
      tableName: "UserForums",
      timestamps: true,
    }
  );

  return UserForum;
};
