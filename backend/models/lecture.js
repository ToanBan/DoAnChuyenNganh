"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Lecture extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Lecture.belongsTo(models.Topic, {
        foreignKey: "topic_id",
        as: "topic",
      });
    }
  }
  Lecture.init(
    {
      topic_id: DataTypes.INTEGER,
      name_lecture: DataTypes.STRING,
      file_path: DataTypes.STRING,
      content_html: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Lecture",
    }
  );
  return Lecture;
};
