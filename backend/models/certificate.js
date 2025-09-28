"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Certificate extends Model {
    static associate(models) {
      Certificate.belongsTo(models.User, { foreignKey: "userId", as: "user" });
      Certificate.belongsTo(models.Course, {
        foreignKey: "courseId",
        as: "course",
      });
      Certificate.belongsTo(models.Teacher, {
        foreignKey: "teacherId",
        as: "teacher",
      });
    }
  }

  Certificate.init(
    {
      uid: DataTypes.STRING,
      userId: {
        type: DataTypes.BIGINT,
        field: "user_id", // ánh xạ tới cột trong DB
      },
      courseId: {
        type: DataTypes.BIGINT,
        field: "course_id",
      },
      teacherId: {
        type: DataTypes.BIGINT,
        field: "teacher_id",
      },
      pdf_path: DataTypes.STRING,
      generated_at: DataTypes.DATE,
      status: DataTypes.STRING,
      note: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Certificate",
    }
  );

  return Certificate;
};
