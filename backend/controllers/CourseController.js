const jwt = require("jsonwebtoken");
const {
  Course,
  Teacher,
  Topic,
  Video,
  Question,
  Lecture,
  User,
  InvoiceItem,
  Invoice,
  UserTopicProgress,
  QuizResult,
  QuizAnswer,
  Certificate,
  CartItem,
  Cart,
  TopicPurchase
} = require("../models");
const { CreateNotification } = require("./Notification");
const { where, Op } = require("sequelize");
const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");
const ffmpeg = require("fluent-ffmpeg");
const redisClient = require("../lib/redis");
const { verify } = require("crypto");

const CreateCourseController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(200).json({
        message: "Xác thực không thành cônng",
      });
    }

    const {
      course_name,
      course_description,
      teacherId,
      price_course,
      what_you_will_learn,
    } = req.body;
    const course_image = req.file?.filename;
    const floatPrice = parseFloat(price_course);
    if (isNaN(floatPrice)) {
      return res.status(400).json({ message: "Giá không hợp lệ" });
    }

    const response = await fetch("http://localhost:8000/generate-tags", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name_course: course_name,
        description_course: course_description,
      }),
    });

    const resTags = await response.json();
    const tags = resTags.tags;

    const course = await Course.create({
      course_name,
      course_description,
      course_image,
      teacher_id: teacherId,
      price: floatPrice,
      what_you_will_learn,
      tags,
    });

    const userAdmin = await User.findOne({ where: { role: "admin" } });
    await CreateNotification(
      decoded.id,
      userAdmin.id,
      "register_course",
      `${decoded.username} đăng ký khóa học`
    );
    if (course) {
      await redisClient.del("all_courses");
      return res.status(200).json({ message: "Thêm Khóa Học Thành Công" });
    } else {
      return res.status(404).json({ message: "Thêm Không Thành Công" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server",
    });
  }
};

const GetCourseController = async (req, res) => {
  const cacheKey = "all_courses";
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        message: JSON.parse(cached),
      });
    }

    const courses = await Course.findAll({
      where: { status: 1 },
      include: [
        {
          model: Teacher,
          as: "teacher",
          attributes: ["id", "name", "email", "avatar"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const plainCourses = courses.map((course) => course.toJSON());
    await redisClient.set(cacheKey, JSON.stringify(plainCourses), { EX: 3600 });
    return res.status(200).json({
      message: courses,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server",
    });
  }
};

const GetCourseByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `course:${id}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        message: JSON.parse(cached),
      });
    }
    const course = await Course.findOne({
      where: { id: id },
      include: [
        {
          model: Teacher,
          as: "teacher",
          required: true,
        },

        {
          model: Topic,
          as: "topics",
          require: true,
          include: [
            {
              model: Video,
              as: "videos",
              require: true,
            },
            {
              model: Lecture,
              as: "lectures",
              require: true,
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      message: course,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server",
    });
  }
};

const EditCourseByIdController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Xác thực không thành công",
      });
    }
    const { id } = req.params;

    const courseToEdit = await Course.findOne({
      where: {
        id: id,
      },
    });

    const imagePath = req.file?.filename;
    if (imagePath) {
      const oldImagePath = path.join(
        __dirname,
        "uploads",
        courseToEdit.course_image
      );

      if (courseToEdit.course_image && fs.existsSync(oldImagePath)) {
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error("Lỗi khi xóa ảnh cũ:", err);
        });
      }
    }
    const {
      course_name,
      course_description,
      price_course,
      what_you_will_learn,
    } = req.body;

    await Course.update(
      {
        course_name: course_name || courseToEdit.course_name,
        course_description:
          course_description || courseToEdit.course_description,
        price: price_course || courseToEdit.price,
        what_you_will_learn:
          what_you_will_learn || courseToEdit.what_you_will_learn,
        course_image: imagePath || courseToEdit.course_image,
      },
      {
        where: { id: id },
      }
    );
    await redisClient.del("all_courses");
    return res.status(200).json({
      message: "Cập Nhật Thành Công",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const DeleteCourseByIdController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({ message: "Xác thực không thành công" });
    }
    const { id } = req.params;
    const course = await Course.findOne({ where: { id } });
    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }
    if (course.course_image) {
      const oldImagePath = path.join(__dirname, "uploads", course.course_image);
      console.log(oldImagePath);
      if (fs.existsSync(oldImagePath)) {
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error("Lỗi khi xóa ảnh cũ:", err);
          else console.log("Ảnh đã được xoá:", course.course_image);
        });
      }
    }
    await redisClient.del("all_courses");
    await Course.destroy({ where: { id } });
    return res.status(200).json({ message: "Xoá thành công" });
  } catch (error) {
    console.error("Lỗi khi xoá khóa học:", error);
    return res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

const CreateTopicController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Xác thực không thành công",
      });
    }

    const { topic_name, topic_description, course_id } = req.body;
    const response = await fetch("http://localhost:8000/generate-tags", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name_course: topic_name,
        description_course: topic_description,
      }),
    });

    const resTags = await response.json();
    const tags = resTags.tags;

    await Topic.create({
      topic_name,
      topic_description,
      course_id,
      tags,
    });
    return res.status(200).json({
      message: topic_description,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const DeleteTopicController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Xác thực không thành công",
      });
    }

    const { id } = req.params;
    const topicToDelete = await Topic.findOne({
      where: {
        id: id,
      },
    });
    if (!topicToDelete) {
      return res.status(404).json({
        message: "Không Tìm Thấy Khóa Học Để Xóa",
      });
    }

    await Topic.destroy({ where: { id } });

    return res.status(200).json({
      message: "Xóa Thành Công",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const CreateVideoController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Xác thực không thành công",
      });
    }
    const { videoTitle, topic_id } = req.body;
    const videoFile = req.file;
    let videoName = null;
    if (videoFile) {
      videoName = videoFile.filename;
    }

    await Video.create({
      video_title: videoTitle,
      video_url: videoName,
      topic_id,
    });

    return res.status(200).json({
      message: "Thêm Video Thành Công",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const CreateQuizzController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Xác thực không thành công",
      });
    }

    const {
      correctAnswerIndex,
      option0,
      option1,
      option2,
      option3,
      quizQuestion,
      explanation,
      topic_id,
    } = req.body;
    const options = {
      A: option0,
      B: option1,
      C: option2,
      D: option3,
    };

    const transCorrectAnswerIndex = parseInt(correctAnswerIndex) - 1;

    const correct_answer = ["A", "B", "C", "D"][transCorrectAnswerIndex];
    await Question.create({
      topic_id,
      question_text: quizQuestion,
      options,
      correct_answer,
      explanation,
    });

    return res.status(200).json({
      message: "Thêm Câu Hỏi Thành Công",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const CreateLectureController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);

    if (!decoded) {
      return res.status(401).json({ message: "Xác thực không thành công" });
    }

    const { topic_id, name_lecture } = req.body;
    const fileLecture = req.file;

    if (!fileLecture) {
      return res.status(400).json({ message: "Không có file được tải lên" });
    }
    const filePath = fileLecture.path;
    const fileName = fileLecture.filename;
    const result = await mammoth.convertToHtml({ path: filePath });
    const contentHtml = result.value;
    const newLecture = await Lecture.create({
      topic_id: topic_id,
      name_lecture: name_lecture,
      file_path: fileName,
      content_html: contentHtml,
    });
    return res.status(200).json({
      message: "Tạo bài giảng thành công",
    });
  } catch (error) {
    console.error("Lỗi khi tạo bài giảng:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const DeleteContentController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Xác thực không thành công",
      });
    }
    const { id, contentId, type } = req.params;
    if (type == "video") {
      const videoDelete = await Video.findOne({ where: { id: contentId } });
      const pathVideo = videoDelete.video_url;
      if (!pathVideo) {
        return res.status(404).json({
          message: "Không Có Video Để Xóa",
        });
      }
      const oldImagePath = path.join(__dirname, "..", "uploads", pathVideo);

      if (fs.existsSync(oldImagePath)) {
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error("Lỗi khi xóa video:", err);
          else console.log("video đã được xóa:", pathVideo);
        });
      }
      await Video.destroy({ where: { id: contentId } });
      return res.status(200).json({
        message: "Xóa Thành Công",
      });
    }

    if (type == "text") {
      const textDelete = await Lecture.findOne({ where: { id: contentId } });
      await Lecture.destroy({ where: { id: contentId } });
      const oldImagePath = path.join(
        __dirname,
        "..",
        "uploads",
        textDelete.file_path
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error("Lỗi khi xóa file:", err);
          else console.log("file đã được xoá:", textDelete.file_path);
        });
      }
      return res.status(200).json({
        message: "Xóa Thành Công",
      });
    }

    if (type == "quiz") {
      const textQuiz = await Question.findOne({ where: { id: contentId } });
      await Question.destroy({ where: { id: contentId } });
      return res.status(200).json({
        message: "Xóa Thành Công",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const CourseBoughtController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({ message: "Xác thực không thành công" });
    }
    const userId = decoded.id;
    const courses = await Course.findAll({
      attributes: ["id", "course_name", "course_description", "course_image"],
      include: [
        {
          model: InvoiceItem,
          as: "InvoiceItems",
          required: true,
          include: [
            {
              model: Invoice,
              as: "Invoice",
              required: true,
              where: { user_id: userId },
            },
          ],
        },
        {
          model: Teacher,
          as: "teacher",
          attributes: ["id", "name", "email", "avatar"],
        },
      ],
    });

    return res.status(200).json({
      message: courses,
    });
  } catch (error) {
    console.error("Lỗi Server");
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const GetPurchasedCourseDetailController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({ message: "Xác thực không thành công" });
    }

    const userId = decoded.id;
    const courseId = req.params.id;

    const invoiceItem = await InvoiceItem.findOne({
      where: { course_id: courseId },
      include: [
        {
          model: Invoice,
          as: "Invoice",
          where: { user_id: userId },
        },
      ],
    });

    if (!invoiceItem) {
      return res.status(403).json({ message: "Bạn chưa mua khóa học này" });
    }

    // Nếu đã mua, trả về thông tin chi tiết khóa học
    const courseDetail = await Course.findOne({
      where: { id: courseId },
      include: [
        {
          model: Topic,
          as: "topics",
          include: [
            { model: Video, as: "videos" },
            { model: Lecture, as: "lectures" },
            { model: Question, as: "questions" }, // nếu cần
          ],
        },
      ],
    });

    return res.status(200).json({ message: courseDetail });
  } catch (error) {
    console.error("Lỗi server:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const CompleteProgressCourseController = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        message: "Not Found Token",
      });
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Xác thực không thành công",
      });
    }

    const { id } = req.params;
    const userId = decoded.id;
    await UserTopicProgress.create({
      user_id: userId,
      topic_id: id,
      is_completed: true,
    });
    return res.status(200).json({
      message: id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const ResultTopicController = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Not Found Token" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params; // topic_id
    const userId = decoded.id;
    const { questionResult } = req.body;

    if (!Array.isArray(questionResult)) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    }

    const score = questionResult.reduce(
      (total, q) => (q.is_correct ? total + 1 : total),
      0
    );

    const totalQuestion = questionResult.length;

    let quizResult = await QuizResult.findOne({
      where: {
        user_id: userId,
        topic_id: id,
      },
    });

    if (quizResult) {
      await QuizResult.update(
        {
          score,
          attempt_number: quizResult.attempt_number + 1,
          correct_count: score,
          total_questions: totalQuestion,
        },
        {
          where: {
            user_id: userId,
            topic_id: id,
          },
        }
      );
      await QuizAnswer.destroy({
        where: {
          quiz_result_id: quizResult.id,
        },
      });
    } else {
      quizResult = await QuizResult.create({
        user_id: userId,
        topic_id: id,
        score,
        attempt_number: 1,
        correct_count: score,
        total_questions: totalQuestion,
      });
    }

    const answers = questionResult.map((q) => ({
      quiz_result_id: quizResult.id,
      question_id: q.question_id,
      is_correct: q.is_correct,
      selected_option: q.selected_option,
    }));

    await QuizAnswer.bulkCreate(answers);
    return res.status(200).json({ message: "Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const GetProgressController = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        message: "Not Found Token",
      });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const courseId = req.params.id;
    const userId = decoded.id;

    const progress = await Topic.findAll({
      where: {
        course_id: courseId,
      },
      attributes: ["id", "topic_name"],
      include: [
        {
          model: UserTopicProgress,
          as: "progresses",
          where: {
            user_id: userId,
          },
          required: false,
          attributes: ["user_id", "is_completed"],
        },
      ],
    });

    return res.status(200).json({
      message: progress,
      courseId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const SearchUidCertificate = async (req, res) => {
  try {
    const { uid } = req.body;
    const certificate = await Certificate.findOne({
      where: { uid },
      include: [
        {
          model: User,
          as: "user", // Phải giống alias bạn đã định nghĩa
        },
        {
          model: Course,
          as: "course",
        },
        {
          model: Teacher,
          as: "teacher",
        },
      ],
    });

    if (!certificate) {
      return res.status(404).json({
        message: "Không Tìm Thấy Chứng Chỉ",
      });
    }
    return res.status(200).json({
      message: certificate,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const GetQuizzController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const userId = decoded.id;
    const { id } = req.params;

    const quizzes = await QuizResult.findAll({
      where: {
        user_id: userId,
        topic_id: id,
      },
      include: [
        {
          model: QuizAnswer,
          required: true,
        },
      ],
    });

    return res.status(200).json({
      message: quizzes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const SearchCourseController = async (req, res) => {
  try {
    const { query } = req.body;

    const results = await Course.findAll({
      where: {
        course_name: {
          [Op.like]: `%${query}%`,
        },
      },
      include: [
        {
          model: Teacher,
          as: "teacher", // đúng với alias bạn đặt
          attributes: ["id", "name", "email"], // chọn các cột bạn muốn lấy
        },
      ],
    });

    return res.status(200).json({
      message: results,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const SuggestionCoursesController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const userId = decoded.id;
    const cartCourses = await CartItem.findAll({
      include: [
        {
          model: Cart,
          where: { user_id: userId },
          attributes: [],
        },
        {
          model: Course,
          attributes: ["id", "tags"],
        },
      ],
    });

    const purchasedCourses = await InvoiceItem.findAll({
      include: [
        {
          model: Invoice,
          as: "Invoice", // ⚠️ bắt buộc dùng đúng alias
          where: { user_id: userId },
          attributes: [],
        },
        {
          model: Course,
          as: "Course", // cũng cần alias nếu bạn có khai báo `as` trong associate
          attributes: ["id", "tags"],
        },
      ],
    });

    const collectedTags = [
      ...cartCourses.map((c) => c.Course?.tags || []),
      ...purchasedCourses.map((c) => c.Course?.tags || []),
    ].flat();
    const userTags = [...new Set(collectedTags)];
    const excludedCourseIds = [
      ...cartCourses.map((c) => c.Course?.id),
      ...purchasedCourses.map((c) => c.Course?.id),
    ];
    const allOtherCourses = await Course.findAll({
      where: {
        id: { [Op.notIn]: excludedCourseIds },
      },
      include: [
        {
          model: Teacher,
          as: "teacher", // hoặc tên bạn đặt alias trong Course.associate
          attributes: ["id", "name", "email", "avatar"], // các cột cần lấy
        },
      ],
    });

    const recommendedCourses = allOtherCourses
      .map((course) => {
        const tags = course.tags || [];
        const matchCount = tags.filter((tag) => userTags.includes(tag)).length;
        return {
          ...course.toJSON(),
          matchCount,
        };
      })
      .filter((c) => c.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount);
    return res.status(200).json({
      message: recommendedCourses,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const SuggestionTopicController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const userId = decoded.id;
    const { id } = req.params;
    const answers = await QuizResult.findOne({
      where: {
        user_id: userId,
        topic_id: id,
      },
    });
    const score = answers?.score || 0;
    if (score < 7) {
      const currentTopic = await Topic.findByPk(id);
      const currentTags = currentTopic.tags || [];
      const allTopics = await Topic.findAll({
        where: {
          id: { [Op.not]: id },
          course_id: { [Op.not]: currentTopic.course_id },
        },
        attributes: [
          "id",
          "topic_name",
          "topic_description",
          "tags",
          "course_id",
        ],
      });

      const suggestions = await Promise.all(
        allTopics.map(async (topic) => {
          const tags = topic.tags || [];
          const matchCount = tags.filter((tag) =>
            currentTags.includes(tag)
          ).length;

          if (matchCount > 0) {
            const course = await Course.findOne({
              where: {
                id: topic.course_id,
              },
            });
            const topicCount = await Topic.count({
              where: { course_id: topic.course_id },
            });
            const topicPrice =
              course && topicCount > 0 ? course.price / topicCount : 0;
            return {
              topic_id: topic.id,
              topic_name: topic.topic_name,
              topic_description: topic.topic_description,
              course_id: course.id,
              course_name: course.course_name,
              topic_price: Math.round(topicPrice),
              tags,
            };
          }

          return null;
        })
      );

      const filtered = suggestions.filter((s) => s !== null).slice(0, 3);

      return res.status(200).json({
        message: filtered,
      });
    }
    return res.status(200).json({
      message: [],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const GetTopicDetailController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const { id } = req.params;
    const topic = await Topic.findOne({
      where: {
        id: id,
      },
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
    });
    return res.status(200).json({
      message: topic,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const GetTopicsPurchasedController = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const userId = decoded.id;
    const purchases = await TopicPurchase.findAll({
      where: {
        user_id: userId,
      },
      include: [
        {
          model: Topic,
          as: "topic", 
          include: [
            {
              model: Course,
              as: "course",
              include: [
                {
                  model: Teacher,
                  as: "teacher",
                  attributes: ["id"],
                  include: [
                    {
                      model: User,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
    return res.status(200).json({
      message: purchases,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  CreateCourseController,
  DeleteCourseByIdController,
  GetCourseController,
  GetCourseByIdController,
  EditCourseByIdController,
  CreateTopicController,
  DeleteTopicController,
  CreateVideoController,
  CreateQuizzController,
  CreateLectureController,
  DeleteContentController,
  CourseBoughtController,
  GetPurchasedCourseDetailController,
  CompleteProgressCourseController,
  ResultTopicController,
  GetProgressController,
  SearchUidCertificate,
  GetQuizzController,
  SearchCourseController,
  SuggestionCoursesController,
  SuggestionTopicController,
  GetTopicDetailController,
  GetTopicsPurchasedController
};
