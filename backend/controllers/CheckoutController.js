const jwt = require("jsonwebtoken");
const {
  Cart,
  Course,
  CartItem,
  Invoice,
  InvoiceItem,
  Topic,
  TopicPurchase,
} = require("../models");
const { where } = require("sequelize");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const CreateCheckoutController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = decoded.id;
    const { selectedItems } = req.body;

    if (!Array.isArray(selectedItems) || selectedItems.length === 0) {
      return res.status(400).json({ message: "Không có sản phẩm được chọn!" });
    }

    const cartItems = await CartItem.findAll({
      where: { course_id: selectedItems },
      include: [
        {
          model: Course,
        },
        {
          model: Cart,
          where: {
            user_id: userId,
          },
        },
      ],
    });

    if (cartItems.length === 0) {
      return res
        .status(400)
        .json({ message: "Không tìm thấy sản phẩm hợp lệ!" });
    }

    const line_items = cartItems.map((ci) => ({
      price_data: {
        currency: "vnd",
        product_data: {
          name: ci.Course.course_name,
        },
        unit_amount: Math.round(ci.Course.price),
      },
      quantity: ci.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
    });

    for (const item of cartItems) {
      await item.update({ stripe_session_id: session.id });
    }

    return res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const CreateCheckoutTopicController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const userId = decoded.id;
    const { topicId, slug } = req.body;

   
    
    const topicById = await Topic.findOne({
      where: {
        id: topicId,
      },
    });

    const courseId = topicById.course_id;
    const course = await Course.findOne({
      where: {
        id: courseId,
      },
    });

    const topicCount = await Topic.count({
      where: {
        course_id: courseId,
      },
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const price = course.price;

    const topicPrice = price / topicCount;
    const line_items = [
      {
        price_data: {
          currency: "vnd",
          product_data: {
            name: topicById.topic_name,
          },
          unit_amount: topicPrice, 
        },
        quantity: 1,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      metadata: {
        type: "topic",
        topic_id: topicId,
        user_id: userId,
        course_id: courseId,
      },
      success_url: `${process.env.FRONTEND_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const GetSessionController = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) {
      return res.status(400).json({ message: "Thiếu session_id" });
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      res.json({
        customer_email: session.customer_details?.email,
        amount_total: session.amount_total,
      });
    } catch (err) {
      console.error("[getSession]", err);
      return res
        .status(500)
        .json({ message: "Không thể lấy thông tin session." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const handleTransactionSuccess = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = session.metadata || {};
    const sessionId = session.id;

    try {
      if (metadata.type === "topic") {
        const { topic_id, user_id, course_id } = metadata;
        const topic = await Topic.findOne({ where: { id: topic_id } });
        const course = await Course.findOne({ where: { id: course_id } });

        if (!topic || !course) {
          return res.status(404).send("Topic or Course not found");
        }
        const topicCount = await Topic.count({ where: { course_id } });
        const topicPrice = course.price / topicCount;
        await TopicPurchase.create({
          user_id,
          topic_id,
          price: topicPrice,
        });
        return res.status(200).send("Topic purchase processed");
      }

      const cartItems = await CartItem.findAll({
        where: { stripe_session_id: sessionId },
        include: [
          { model: Course },
          { model: Cart }
        ],
      });

      if (!cartItems || cartItems.length === 0) {
        return res.status(404).send("Cart items not found for session");
      }

      const userId = cartItems[0].Cart.user_id;
      const cartId = cartItems[0].cart_id;

      const total = cartItems.reduce(
        (sum, item) => sum + item.Course.price * item.quantity,
        0
      );

      const invoice = await Invoice.create({
        user_id: userId,
        cart_id: cartId,
        total,
      });

      for (const item of cartItems) {
        await InvoiceItem.create({
          invoice_id: invoice.id,
          course_id: item.Course.id,
          course_name: item.Course.course_name,
          price: item.Course.price,
          quantity: item.quantity,
        });
      }
      
      await Promise.all(
        cartItems.map((item) =>
          item.update({ stripe_session_id: null }) 
        )
      );

      return res.status(200).send("Cart purchase processed");
    } catch (err) {
      console.error("❌ Error processing webhook:", err);
      return res.status(500).send("Server error");
    }
  }

  return res.status(200).send("Event ignored");
};


module.exports = {
  CreateCheckoutController,
  GetSessionController,
  handleTransactionSuccess,
  CreateCheckoutTopicController,
};
