"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Teacher extends Model {
    static associate(models) {
      // Giáo viên thuộc về 1 người dùng
      Teacher.belongsTo(models.User, { foreignKey: "user_id" });
      Teacher.hasMany(models.Course, {
        foreignKey: "teacher_id",
        as: "courses",
      });
    }
  }

  Teacher.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      phone: DataTypes.STRING,
      birthday: DataTypes.DATEONLY,
      address: DataTypes.STRING,
      avatar: DataTypes.STRING,
      certification: DataTypes.STRING,
      experience_teacher: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      major: DataTypes.STRING,
      status: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: "Status: -1 = Rejected, 0 = Pending, 1 = Approved",
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Teacher",
      tableName: "teachers",
    }
  );

  return Teacher;
};
