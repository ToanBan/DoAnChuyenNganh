"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Một người dùng có thể có một giáo viên (nếu họ đăng ký làm giáo viên)
      User.hasOne(models.Teacher, { foreignKey: "user_id" });
      User.hasMany(models.Invoice, { foreignKey: "user_id", as: "invoices" });
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
