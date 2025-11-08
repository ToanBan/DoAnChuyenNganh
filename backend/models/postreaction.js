'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PostReaction extends Model {
    static associate(models) {
      PostReaction.belongsTo(models.User, { foreignKey: 'userId' });
      PostReaction.belongsTo(models.Post, { foreignKey: 'postId', as: 'post' });

    }
  }

  PostReaction.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reactionType: {
      type: DataTypes.ENUM('like', 'love', 'haha', 'wow', 'sad', 'angry'),
      allowNull: false,
      defaultValue: 'like'
    }
  }, {
    sequelize,
    modelName: 'PostReaction',
  });

  return PostReaction;
};
