"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserTopicProgress extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UserTopicProgress.belongsTo(models.Topic, {
        foreignKey: "topic_id",
        as: "topic",
      });
    }
  }
  UserTopicProgress.init(
    {
      user_id: DataTypes.INTEGER,
      topic_id: DataTypes.INTEGER,
      is_completed: DataTypes.BOOLEAN,
      completed_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "UserTopicProgress",
    }
  );
  return UserTopicProgress;
};
