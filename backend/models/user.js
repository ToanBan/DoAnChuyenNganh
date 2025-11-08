"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.Teacher, { foreignKey: "user_id" });
      User.hasMany(models.Invoice, { foreignKey: "user_id", as: "invoices" });
      User.hasMany(models.Post, {
        foreignKey: "userId",
        as: "posts",
      });
      User.hasMany(models.PostReaction, {
        foreignKey: "userId",
        as: "reactions",
      });
      User.hasMany(models.CommentPost, {
        foreignKey: "userId",
        as: "comments",
      });
      User.belongsToMany(models.Forum, {
        through: models.UserForum,
        foreignKey: "userId",
        as: "forums",
      });

      User.hasMany(models.UserTopicProgress, {
        foreignKey: "user_id",
        as: "topic_progresses",
      });
    }
  }

  User.init(
    {
      username: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      image: DataTypes.STRING,
      description: DataTypes.TEXT,
      address: DataTypes.STRING,
      phone: DataTypes.STRING,
      avatar: DataTypes.STRING,
      role: {
        type: DataTypes.STRING,
        defaultValue: "user",
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );

  return User;
};
