"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    static associate(models) {
      Course.belongsTo(models.Teacher, {
        foreignKey: "teacher_id",
        as: "teacher",
      });

      Course.hasMany(models.Topic, {
        foreignKey: "course_id",
        as: "topics",
      });

      Course.hasMany(models.InvoiceItem, {
        as: "InvoiceItems",
        foreignKey: "course_id",
      });
    }
  }
  Course.init(
    {
      course_name: DataTypes.STRING,
      course_description: DataTypes.TEXT,
      course_image: DataTypes.STRING,
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        comment: "Giá của khóa học",
      },
      what_you_will_learn: DataTypes.TEXT,
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isIn: [[-1, 0, 1]],
        },
        comment:
          "Trạng thái khóa học: -1 = từ chối, 0 = chờ duyệt, 1 = đã duyệt",
      },
      tags: {
        type: DataTypes.JSON, // hoặc DataTypes.TEXT nếu bạn dùng TEXT
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Course",
    }
  );
  return Course;
};
