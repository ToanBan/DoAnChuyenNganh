const jwt = require("jsonwebtoken");
const {
  Teacher,
  Course,
  User,
  Topic,
  Video,
  Question,
  Lecture,
  Invoice,
  InvoiceItem,
} = require("../models");

const { Sequelize, Op, where } = require("sequelize");
const { CreateNotification } = require("./Notification");

const RegisterTeacherController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      console.error("Authencation failed");
      return;
    }
    const { fullName, email, phone, birthday, major, experience, address } =
      req.body;
    const profilePic = req.files?.profilePic?.[0].filename;
    const certification = req.files?.certification?.[0].filename;
    await Teacher.create({
      name: fullName,
      email,
      phone,
      birthday,
      avatar: profilePic,
      certification,
      experience_teacher: experience,
      major: major,
      user_id: decoded.id,
      address: address,
    });
    const userAdmin = await User.findOne({ where: { role: "admin" } });
    await CreateNotification(
      decoded.id,
      userAdmin.id,
      "register_teacher",
      `${decoded.username} đăng ký làm giáo viên`
    );
    return res.status(200).json({ message: "Đăng Ký Thành Công" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server",
    });
  }
};

const GetTeacherByIdController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Xác thực không thành công",
      });
    }
    const userId = decoded.id;
    const teacher = await Teacher.findOne({
      include: [
        {
          model: User,
          where: { id: userId },
          required: true,
        },
      ],
      attributes: ["id"],
    });

    return res.status(200).json({
      message: teacher,
    });
  } catch (error) {
    console.error("Lỗi server");
    return res.status(500).json({
      message: "Internal Server",
    });
  }
};

const GetCourseByTeacherId = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      console.error("Xác thực không thành công");
      return res.status(401).json({
        message: "Xác thực không thành công",
      });
    }

    const { id } = req.params;
    const courseByTeacherId = await Course.findAll({
      where: {
        teacher_id: id,
      },
      include: [
        {
          model: Topic,
          as: "topics",
          attributes: ["id", "topic_name", "topic_description"],
          include: [
            {
              model: Video,
              as: "videos",
            },
            {
              model: Question,
              as: "questions",
            },
            {
              model: Lecture,
              as: "lectures",
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      message: courseByTeacherId,
    });
  } catch (error) {
    console.error("Lỗi Server");
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const GetTeacherOverview = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const userId = decoded.id;
    const teacher = await Teacher.findOne({
      where: {
        user_id: userId,
      },
    });

    if (!teacher) {
      return res.status(404).json({
        message: "Not Found",
      });
    }

    const teacherId = await teacher.id;
    const teacher_courses = await Course.count({
      where: { teacher_id: teacherId },
    });
    const courses = await Course.findAll({
      where: { teacher_id: teacherId },
      attributes: ["id"],
    });
    const courseIds = courses.map((course) => course.id);
    if (courseIds.length === 0) {
      return res.status(200).json({ message: 0 });
    }
    const revenueData = await InvoiceItem.findAll({
      where: {
        course_id: {
          [Op.in]: courseIds,
        },
      },
      attributes: [
        [
          Sequelize.fn("SUM", Sequelize.literal("price * quantity")),
          "totalRevenue",
        ],
      ],
      raw: true,
    });
    const totalRevenue = revenueData[0].totalRevenue || 0;

    const revenueByMonth = await InvoiceItem.findAll({
      where: { course_id: { [Op.in]: courseIds } },
      attributes: [
        [
          Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"), "%Y-%m"),
          "month",
        ],
        [
          Sequelize.fn("SUM", Sequelize.literal("price * quantity")),
          "monthlyRevenue",
        ],
      ],
      group: [Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"), "%Y-%m")],
      order: [
        [
          Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"), "%Y-%m"),
          "ASC",
        ],
      ],
      raw: true,
    });

    const monthlySales = await InvoiceItem.findAll({
      where: {
        course_id: { [Op.in]: courseIds },
      },
      attributes: [
        [
          Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"), "%Y-%m"),
          "month",
        ],
        [Sequelize.fn("SUM", Sequelize.col("quantity")), "totalSold"],
      ],
      group: [Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"), "%Y-%m")],
      order: [
        [
          Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"), "%Y-%m"),
          "ASC",
        ],
      ],
      raw: true,
    });
    const course_rejected = await Course.count({
      where: {
        teacher_id: teacherId,
        status: -1,
      },
    });

    const course_accepted = await Course.count({
      where: {
        teacher_id: teacherId,
        status: 1,
      },
    });

    const totalSoldResult = await InvoiceItem.findOne({
      where: {
        course_id: {
          [Op.in]: courseIds,
        },
      },
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("quantity")), "totalSold"],
      ],
      raw: true,
    });

    const course_pending = await Course.count({
      where: {
        teacher_id: teacherId,
        status: 0,
      },
    });
    return res.status(200).json({
      teacher_courses,
      totalRevenue,
      revenueByMonth,
      monthlySales,
      course_rejected,
      course_accepted,
      course_pending,
      totalSoldResult,
    });
  } catch (err) {
    console.error("[GetTeacherOverview]", err);
    res.status(500).json({ message: "Lỗi khi lấy thống kê giáo viên." });
  }
};

const GetCourseTeacherAcceptController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const userId = decoded.id;
    const teacher = await Teacher.findOne({
      where: {
        user_id: userId,
      },
    });

    if (!teacher) {
      return res.status(404).json({
        message: "Not Found",
      });
    }

    const teacherId = await teacher.id;

    const course_accept = await Course.findAll({
      where: {
        teacher_id: teacherId,
        status: 1,
      },
      include: [
        {
          model: Topic,
          as: "topics",
          include: [
            {
              model: Video,
              as: "videos",
            },
            {
              model: Lecture,
              as: "lectures",
            },
            {
              model: Question,
              as: "questions",
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      message: course_accept,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const GetCourseTeacherRejectController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const userId = decoded.id;
    const teacher = await Teacher.findOne({
      where: {
        user_id: userId,
      },
    });

    if (!teacher) {
      return res.status(404).json({
        message: "Not Found",
      });
    }

    const teacherId = await teacher.id;
    const course_reject = await Course.findAll({
      where: {
        teacher_id: teacherId,
        status: -1,
      },
      include: [
        {
          model: Topic,
          as: "topics",
          include: [
            {
              model: Video,
              as: "videos",
            },
            {
              model: Lecture,
              as: "lectures",
            },
            {
              model: Question,
              as: "questions",
            },
          ],
        },
      ],
    });
    return res.status(200).json({
      message: course_reject,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const GetCourseTeacherPendingController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const userId = decoded.id;
    const teacher = await Teacher.findOne({
      where: {
        user_id: userId,
      },
    });

    if (!teacher) {
      return res.status(404).json({
        message: "Not Found",
      });
    }

    const teacherId = await teacher.id;
    const course_pending = await Course.findAll({
      where: {
        teacher_id: teacherId,
        status: 0,
      },
      include: [
        {
          model: Topic,
          as: "topics",
          include: [
            {
              model: Video,
              as: "videos",
            },
            {
              model: Lecture,
              as: "lectures",
            },
            {
              model: Question,
              as: "questions",
            },
          ],
        },
      ],
    });
    return res.status(200).json({
      message: course_pending,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const GetCoursesPurchasedByTeacher = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const userId = decoded.id;
    const teacher = await Teacher.findOne({
      where: {
        user_id: userId,
      },
    });

    if (!teacher) {
      return res.status(404).json({
        message: "Not Found",
      });
    }

    const teacherId = await teacher.id;
    const result = await InvoiceItem.findAll({
      include: [
        {
          model: Course,
          as: "Course",
          where: {
            teacher_id: teacherId,
          },
          include: [
            {
              model: Teacher,
              as: "teacher",
              attributes: ["id"],
              include: [
                {
                  model: User,
                  attributes: ["username", "avatar"],
                },
              ],
            },
          ],
        },
      ],
      attributes: [
        "course_id",
        [Sequelize.fn("SUM", Sequelize.col("quantity")), "total_quantity"],
      ],
      group: ["course_id"],
      raw: false,
    });

    return res.status(200).json({ message: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const GetStudentsTeacherController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const userId = decoded.id;
    const teacher = await Teacher.findOne({
      where: {
        user_id: userId,
      },
    });

    if (!teacher) {
      return res.status(404).json({
        message: "Not Found",
      });
    }

    const teacherId = await teacher.id;
    const students = await User.findAll({
      include: [
        {
          model: Invoice,
          as: "invoices",
          required: true, 
          include: [
            {
              model: InvoiceItem,
              as: "InvoiceItems",
              required: true, 
              include: [
                {
                  model: Course,
                  as: "Course",
                  required: true,
                  where: {
                    teacher_id: teacherId,
                  },
                  attributes: ["id", "course_name", "price", "course_image"],
                },
              ],
            },
          ],
        },
      ],
      where: {
        role: "user",
      },
    });

    return res.status(200).json({
      message: students,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  RegisterTeacherController,
  GetTeacherByIdController,
  GetCourseByTeacherId,
  GetTeacherOverview,
  GetCourseTeacherAcceptController,
  GetCourseTeacherPendingController,
  GetCourseTeacherRejectController,
  GetCoursesPurchasedByTeacher,
  GetStudentsTeacherController,
};
