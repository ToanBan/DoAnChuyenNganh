const jwt = require("jsonwebtoken");
const {
  Teacher,
  User,
  Course,
  InvoiceItem,
  Invoice,
  Certificate,
} = require("../models");
const redisClient = require("../lib/redis");
const { where } = require("sequelize");
const { CreateNotification, GetNotification } = require("./Notification");
const { Sequelize } = require("sequelize");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");
const GetRequestTeacherController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Xác thực không thành công",
      });
    }
    const request_teachers = await Teacher.findAll({
      where: {
        status: 0,
      },
    });

    return res.status(200).json({
      message: request_teachers,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server",
    });
  }
};

const ResponseRequestToUserController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      console.error("Xác thực không thành công");
      return res.status(401).json({
        message: "Xác thực không thành công",
      });
    }

    const { status, userId } = req.body;
    let saveStatus = null;
    const AdminId = decoded.id;
    if (status === "Approved") {
      saveStatus = 1;
      await User.update(
        { role: "teacher" },
        {
          where: { id: userId },
        }
      );
      await CreateNotification(
        AdminId,
        userId,
        "response_from_admin",
        "Yêu cầu đăng ký làm giáo viên của bạn đã được chấp nhận"
      );
    } else {
      saveStatus = -1;
      await CreateNotification(
        AdminId,
        userId,
        "response_from_admin",
        "Rất tiếc, yêu cầu đăng ký làm giáo viên của bạn đã bị từ chối"
      );
    }

    const result = await Teacher.update(
      { status: saveStatus },
      {
        where: { user_id: userId },
      }
    );

    if (result) {
      return res.status(200).json({
        message: saveStatus,
      });
    } else {
      return res.status(404).json({
        message: "Không Tìm Thấy",
      });
    }
  } catch (error) {
    console.error("Lỗi Server");
    return res.status(500).json({
      message: "Internal Server",
    });
  }
};

const GetTeacherController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Xác thực không thành công",
      });
    }
    const teachers = await Teacher.findAll({
      where: {
        status: 1,
      },
    });

    return res.status(200).json({
      message: teachers,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server",
    });
  }
};

const GetCoursePendingController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Xác thưc không thành công",
      });
    }

    const courses = await Course.findAll({
      where: { status: 0 },
      include: [
        {
          model: Teacher,
          as: "teacher",
          required: true,
          attributes: ["id", "name", "email"],
        },
      ],
    });

    return res.status(200).json({
      message: courses,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const GetCourseAcceptController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Xác thưc không thành công",
      });
    }

    const courses = await Course.findAll({
      where: { status: 1 },
      include: [
        {
          model: Teacher,
          as: "teacher",
          required: true,
          attributes: ["id", "name", "email"],
        },
      ],
    });

    return res.status(200).json({
      message: courses,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const GetAllCourseByTeacher = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Xác thực không thành công",
      });
    }

    const teachers = await Teacher.findAll({
      include: [
        {
          model: Course,
          as: "courses",
          attributes: ["id", "course_name", "price", "status", "course_image"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({
      message: teachers,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const ResponseRequestCourseToUserController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      console.error("Xác thực không thành công");
      return res.status(401).json({
        message: "Xác thực không thành công",
      });
    }
    const AdminId = decoded.id;
    const { status, courseID } = req.body;
    const course = await Course.findOne({
      where: { id: courseID },
      include: [
        {
          model: Teacher,
          as: "teacher",
          include: [
            {
              model: User,
              attributes: ["id", "username"],
            },
          ],
        },
      ],
    });
    if (!course) {
      return res.status(404).json({
        message: "Not Found",
      });
    }

    const userId = course.teacher.User.id;
    if (!userId) {
      return res.status(404).json({
        message: "Not Found",
      });
    }
    let saveStatus = null;
    if (status === "Approved") {
      saveStatus = 1;
      await redisClient.del("all_courses");
    } else {
      saveStatus = -1;
    }

    const result = await Course.update(
      { status: saveStatus },
      {
        where: { id: courseID },
      }
    );

    if (result) {
      if (saveStatus == 1) {
        await CreateNotification(
          AdminId,
          userId,
          "response_from_admin",
          `Hệ Thông Đã Phê Duyệt Khóa Học Của Bạn`
        );
      } else {
        await CreateNotification(
          AdminId,
          userId,
          "response_from_admin",
          `Hệ Thông Đã Từ Chối Khóa Học Của Bạn`
        );
      }
      return res.status(200).json({
        message: "Xử Lý Thành Công",
      });
    } else {
      return res.status(404).json({
        message: "Không Tìm Thấy",
      });
    }
  } catch (error) {
    console.error("Lỗi Server");
    return res.status(500).json({
      message: "Internal Server",
    });
  }
};

const GetAllUserController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Xác thực không thành công",
      });
    }

    const users = await User.findAll({
      include: [
        {
          model: Teacher,
          as: "Teacher",
        },
      ],
      order: [["createdAt", "DESC"]], // Sắp xếp theo ngày tạo, giảm dần
    });

    return res.status(200).json({
      message: users,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Intenal Server Error",
    });
  }
};

const GetStatisticOverview = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Xác thực không thành công",
      });
    }

    const courses_accept = await Course.count({ where: { status: 1 } });
    const courses_rejected = await Course.count({ where: { status: -1 } });
    const courses_pending = await Course.count({ where: { status: 0 } });
    const teachers_accept = await Teacher.count({ where: { status: 1 } });
    const bougth_courses = await InvoiceItem.count();
    const monthlyRevenue = await Invoice.findAll({
      attributes: [
        [Sequelize.fn("MONTH", Sequelize.col("createdAt")), "month"],
        [Sequelize.fn("SUM", Sequelize.col("total")), "total_revenue"],
      ],
      group: ["month"],
      order: [[Sequelize.fn("MONTH", Sequelize.col("createdAt")), "ASC"]],
    });

    const monthlySold = await InvoiceItem.findAll({
      attributes: [
        [Sequelize.fn("MONTH", Sequelize.col("createdAt")), "month"],
        [Sequelize.fn("SUM", Sequelize.col("quantity")), "total_sold"],
      ],
      group: [Sequelize.fn("MONTH", Sequelize.col("createdAt"))],
      order: [[Sequelize.fn("MONTH", Sequelize.col("createdAt")), "ASC"]],
      raw: true,
    });
    return res.status(200).json({
      courses_accept,
      courses_rejected,
      courses_pending,
      teachers_accept,
      bougth_courses,
      monthlyRevenue,
      monthlySold,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const SetRoleUser = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Xác thực không thành công",
      });
    }

    const { selectedUserId, selectedRole } = req.body;
    await User.update(
      { role: selectedRole },
      { where: { id: selectedUserId } }
    );
    return res.status(200).json({
      message: "Cập Nhật Role Thành Công",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const GetStudentFollowCourseController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Xác thực không thành công",
      });
    }
    const students = await User.findAll({
      where: { role: "user" },
      include: [
        {
          model: Invoice,
          as: "invoices",
          include: [
            {
              model: InvoiceItem,
              as: "InvoiceItems",
              include: [
                {
                  model: Course,
                  as: "Course",
                  attributes: ["id", "course_name", "price", "course_image"],
                },
              ],
            },
          ],
        },
      ],
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

const GetCourseBoughtController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Xác thực không thành công",
      });
    }

    const courses = await InvoiceItem.findAll({
      include: [
        {
          model: Course,
          as: "Course",
          attributes: ["id", "course_name", "price", "course_image"],
          include: [
            {
              model: Teacher,
              as: "teacher",
              attributes: ["id", "name", "email"],
            },
          ],
        },
        {
          model: Invoice,
          as: "Invoice",
          attributes: ["id", "total"],
        },
      ],
    });

    return res.status(200).json({
      message: courses,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const ProvideCertificateController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = decoded.id;
    const { slug } = req.body;

    const user = await User.findOne({ where: { id: userId } });

    const course = await Course.findOne({
      where: { id: slug },
      include: [
        {
          model: Teacher,
          as: "teacher",
          required: true,
        },
      ],
    });

    if (!user || !course) {
      return res.status(404).json({ message: "Not Found" });
    }
    let certificate = await Certificate.findOne({
      where: {
        user_id: userId,
        course_id: slug,
      },
    });
    let fileName;
    let outputPath;
    if (certificate) {
      fileName = `certificate-${certificate.uid}.pdf`;
      outputPath = path.join(__dirname, "../uploads/certificates", fileName);

      if (fs.existsSync(outputPath)) {
        const pdfBuffer = fs.readFileSync(outputPath);
        res.set({
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        });
        return res.send(pdfBuffer);
      }
    } else {
      const certificateUID = uuidv4();
      const qrData = `http://localhost:3000/verify_certificate?uid=${certificateUID}`;
      const qrCodeDataURL = await QRCode.toDataURL(qrData);
      const templatePath = path.join(
        __dirname,
        "../templates/certificate.html"
      );
      let html = fs.readFileSync(templatePath, "utf8");

      html = html
        .replace(/{{studentName}}/g, user.username)
        .replace(/{{courseName}}/g, course.course_name)
        .replace(/{{instructorName}}/g, course.teacher.name)
        .replace(/{{completionDate}}/g, new Date().toLocaleDateString("vi-VN"))
        .replace(/{{issueDate}}/g, new Date().toLocaleDateString("vi-VN"))
        .replace(/{{qrCodeDataURL}}/g, qrCodeDataURL);

      const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        landscape: true, 
        margin: { top: "0", right: "0", bottom: "0", left: "0" }, 
        preferCSSPageSize: true, 
      });

      await browser.close();

      fileName = `certificate-${certificateUID}.pdf`;
      outputPath = path.join(__dirname, "../uploads/certificates", fileName);

      const folderPath = path.dirname(outputPath);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      fs.writeFileSync(outputPath, pdfBuffer);

      await Certificate.create({
        uid: certificateUID,
        userId: userId,
        courseId: course.id,
        teacherId: course.teacher.id,
        pdf_path: `/uploads/certificates/${fileName}`,
        generated_at: new Date(),
        status: "approved",
      });

      

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      });

      return res.send(pdfBuffer);
    }

  
    return res.status(404).json({ message: "Certificate file not found." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  GetRequestTeacherController,
  GetTeacherController,
  ResponseRequestToUserController,
  GetCoursePendingController,
  ResponseRequestCourseToUserController,
  GetCourseAcceptController,
  GetAllCourseByTeacher,
  GetAllUserController,
  GetStatisticOverview,
  SetRoleUser,
  GetStudentFollowCourseController,
  GetCourseBoughtController,
  ProvideCertificateController,
};
