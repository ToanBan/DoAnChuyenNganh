'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TopicPurchase extends Model {
    static associate(models) {
      TopicPurchase.belongsTo(models.Topic, { foreignKey: "topic_id", as: "topic" });
    }
  }
  TopicPurchase.init({
    user_id: DataTypes.INTEGER,
    topic_id: DataTypes.INTEGER,
    price: DataTypes.FLOAT,
  }, {
    sequelize,
    modelName: 'TopicPurchase',
  });
  return TopicPurchase;
};