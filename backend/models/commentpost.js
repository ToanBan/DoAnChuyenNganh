'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CommentPost extends Model {
    static associate(models) {
      CommentPost.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      CommentPost.belongsTo(models.Post, { foreignKey: 'postId', as: 'post' });
      CommentPost.belongsTo(models.CommentPost, { as: 'parent', foreignKey: 'parentId' });
      CommentPost.hasMany(models.CommentPost, { as: 'replies', foreignKey: 'parentId' });
    }
  }

  CommentPost.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      postId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'CommentPost',
    }
  );

  return CommentPost;
};