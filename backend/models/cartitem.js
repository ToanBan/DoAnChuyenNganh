'use strict';
module.exports = (sequelize, DataTypes) => {
  const CartItem = sequelize.define('CartItem', {
    cart_id: DataTypes.INTEGER,
    course_id: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    stripe_session_id: DataTypes.STRING
  }, {});
  CartItem.associate = function(models) {
    CartItem.belongsTo(models.Cart, { foreignKey: 'cart_id' });
    CartItem.belongsTo(models.Course, { foreignKey: 'course_id' });
  };
  return CartItem;
};