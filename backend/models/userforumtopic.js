'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserForumTopic extends Model {
    static associate(models) {
      // Quan hệ đến User
      UserForumTopic.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });

      // Quan hệ đến ForumTopic
      UserForumTopic.belongsTo(models.ForumTopic, {
        foreignKey: 'forumTopicId',
        as: 'forumTopic',
      });

      // Quan hệ đệ quy: 1 bản ghi có thể có parent
      UserForumTopic.belongsTo(models.UserForumTopic, {
        foreignKey: 'parentId',
        as: 'parent',
      });

      // Và 1 bản ghi có thể có nhiều con
      UserForumTopic.hasMany(models.UserForumTopic, {
        foreignKey: 'parentId',
        as: 'children',
      });
    }
  }

  UserForumTopic.init(
    {
      userId: DataTypes.INTEGER,
      forumTopicId: DataTypes.INTEGER,
      parentId: DataTypes.INTEGER,
      content: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'UserForumTopic',
      tableName: 'UserForumTopics',
    }
  );

  return UserForumTopic;
};
