const { where } = require("sequelize");
const { Cart, Course, CartItem } = require("../models");
const jwt = require("jsonwebtoken");

const AddToCartController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = decoded.id;
    const { courseId, quantity } = req.body;

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: "Khóa học không tồn tại!" });
    }

    let cart = await Cart.findOne({ where: { user_id: userId } });
    if (!cart) {
      cart = await Cart.create({ user_id: userId });
    }

    // Tìm item trong giỏ
    let item = await CartItem.findOne({
      where: { cart_id: cart.id, course_id: courseId },
    });

    if (item) {
      item.quantity += quantity || 1;
      await item.save();
    } else {
      await CartItem.create({
        cart_id: cart.id,
        course_id: courseId,
        quantity: quantity || 1,
      });
    }

    return res.status(200).json({ message: "Thêm vào giỏ hàng thành công!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const GetCartController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = decoded.id;

    const cart = await Cart.findOne({
      where: { user_id: userId },
      include: [
        {
          model: CartItem,
          include: [
            {
              model: Course,
              attributes: ["id", "course_name", "price", "course_image"],
            },
          ],
        },
      ],
    });

    if (!cart || !cart.CartItems) {
      return res.json({ items: [] });
    }

    const items = cart.CartItems.map((ci) => ({
      id: ci.Course.id,
      name: ci.Course.course_name,
      price: Number(ci.Course.price),
      quantity: ci.quantity,
      image: ci.Course.course_image,
    }));

    return res.json({ items });
  } catch (error) {
    console.error("[getCart] error:", error);
    return res.status(500).json({ message: "Lỗi khi lấy giỏ hàng!" });
  }
};

const RemoveFromCartController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = decoded.id;
    const { courseId } = req.body;

    const cart = await Cart.findOne({ where: { user_id: userId } });
    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tìm thấy" });
    }

    const item = await CartItem.findOne({
      where: { cart_id: cart.id, course_id: courseId },
    });

    if (item) {
      await item.destroy();
    }

    return res.status(200).json({ message: "Xóa item thành công" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const CountCartItemsController = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = decoded.id;

    const count_cart_item = await CartItem.count({
      include: [
        {
          model: Cart,
          where: { user_id: userId },
        },
      ],
    });

    return res.json({ message: count_cart_item });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  AddToCartController,
  GetCartController,
  RemoveFromCartController,
  CountCartItemsController,
};
