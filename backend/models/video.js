"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Video extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Video.belongsTo(models.Topic, {
        foreignKey: "topic_id",
        as: "topic",
      });
    }
  }
  Video.init(
    {
      video_title: DataTypes.STRING,
      video_url: DataTypes.STRING,
      topic_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Video",
    }
  );
  return Video;
};
