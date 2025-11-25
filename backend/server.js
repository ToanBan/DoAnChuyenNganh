
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const app = express();
const pool = require("./config/database");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const jwt = require("jsonwebtoken");
// require("./recommendation/schedule")
require("dotenv").config();
const {
  RegisterController,
  LoginController,
  GetAuthencationUser,
  LogoutController,
  RefreshTokenController,
  ForgotAccountController,
  VerifyOTPController,
  ResetPasswordController,
  CheckStepForgotController,
  RedirectGoogleLoginController,
  GetDataLoginGoogleController,
  EditProfileController,
  CheckRoleUser,
} = require("./controllers/Authencation");
const {
  RegisterTeacherController,
  GetTeacherByIdController,
  GetCourseByTeacherId,
  GetTeacherOverview,
  GetCourseTeacherAcceptController,
  GetCourseTeacherPendingController,
  GetCourseTeacherRejectController,
  GetCoursesPurchasedByTeacher,
  GetStudentsTeacherController,
  GetTopicProgressController
} = require("./controllers/TeacherController");
const VerifyToken = require("./middleware/VerifyToken");
const {
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
} = require("./controllers/AdminController");
const {
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
  ResultTopicController,
  CompleteProgressCourseController,
  GetProgressController,
  SearchUidCertificate,
  GetQuizzController,
  SearchCourseController,
  SuggestionCoursesController,
  SuggestionTopicController,
  GetTopicDetailController,
  GetTopicsPurchasedController,
} = require("./controllers/CourseController");

const {
  AddToCartController,
  GetCartController,
  RemoveFromCartController,
  CountCartItemsController,
} = require("./controllers/CartController");
const {
  GetNotificationController,
  ReadedNotificationController,
} = require("./controllers/Notification");
const {
  CreateCheckoutController,
  GetSessionController,
  handleTransactionSuccess,
  CreateCheckoutTopicController,
} = require("./controllers/CheckoutController");
const {
  AddCommentController,
  GetCommentByCourseIdController,
  AddCommentPost,
  GetCommentByPostId,
  AddCommentForumTopic, 
  GetCommentsForumTopic
} = require("./controllers/CommentController");
const {
  AddPost,
  GetPost,
  FakePostForUser,
  ToggleReaction,
  GetCountLikeForPost,
  CheckDisplayReaction,
  FakeUserReactionPosts,
  FakeUserCommentPost,
} = require("./controllers/PostController");
const {
  GetContentDataset,
  GetBehaviorUser,
  cleanContentDatasetWithLLM,
  cleanForumDatasetWithLLM,
  calculationSimilarityContentForum,
  calculationSimilarityBehaviorForum,
  finalSimilarity,
  extractKeywordsLLM,
  exportQuizDataset,
} = require("./controllers/GetDatasetController");
const { AddForum, JoinForum, GetForumDetail, GetPostForum, JoinedForum, QuitForum} = require("./controllers/ForumController");
const {generateChatbotResponse} = require("./controllers/ChatbotController")
const {getRecommendedForums} = require("./controllers/RecommendationController");
const { GetWeakTopicsRecommendation } = require("./controllers/WeakTopicsController");

app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  handleTransactionSuccess
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ImageTime = Date.now();
    cb(null, ImageTime + "-" + file.originalname);
  },
});

const upload = multer({ storage });

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.use((socket, next) => {
  const cookieHeader = socket.handshake.headers.cookie;
  if (!cookieHeader) return next(new Error("No cookie"));

  const cookies = {};
  cookieHeader.split(";").forEach((c) => {
    const [k, v] = c.trim().split("=");
    cookies[k] = v;
  });

  const token = cookies.token;
  if (!token) return next(new Error("No token"));
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    socket.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    return next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("new_comment", (data) => {
    console.log("New comment data received:", data);
    AddCommentController(io, socket, data);
  });

  socket.on("joinPostRoom", (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  socket.on("newComment", (data) => {
    console.log("New comment data received:", data);
    AddCommentPost(io, socket, data);
  });

  socket.on("joinForumRoom", (room) => {
    socket.join(room);
    console.log(`socket forum ${socket.id} joined room: ${room}`)
  })

  socket.on("newCommentForum", (data) => {
    console.log("New comment data received:", data);
    AddCommentForumTopic(io, socket, data);
  });

  socket.on("leavePostRoom", (room) => {
    socket.leave(room);
  });
});
app.get("/api/dev/export-quiz-dataset", async (req, res) => {
  try {
    await exportQuizDataset();
    return res.status(200).json({ message: "Export quiz_dataset.json OK" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Export failed" });
  }
});
app.get("/api/user", VerifyToken, GetAuthencationUser);
app.post("/api/register", upload.single(""), RegisterController);
app.post("/api/login", upload.single(""), LoginController);
app.post("/api/logout", LogoutController);
app.get("/api/refresh-token", RefreshTokenController);
app.post("/api/forgot", ForgotAccountController);
app.post("/api/verify-otp", VerifyOTPController);
app.post("/api/reset-password", upload.single(""), ResetPasswordController);
app.get("/api/check-step", CheckStepForgotController);
app.get("/api/google", RedirectGoogleLoginController);
app.get("/api/auth/google/callback", GetDataLoginGoogleController);
app.post(
  "/api/teacher/register",
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "certification", maxCount: 1 },
  ]),
  RegisterTeacherController
);
app.post(
  "/api/user/edit",
  upload.single("profileImage"),
  EditProfileController
);
app.get("/api/teacher_requests", GetRequestTeacherController);
app.get("/api/teachers", GetTeacherController);
app.post("/api/teacher_request_status", ResponseRequestToUserController);
app.post("/api/courses", upload.single("image_course"), CreateCourseController);
app.get("/api/teacherById", GetTeacherByIdController);
app.get("/api/teacher_students", GetStudentsTeacherController);
app.get("/api/courses", GetCourseController);
app.post("/api/courses/search", SearchCourseController);
app.get("/api/courses/:id", GetCourseByIdController);
app.get("/api/courses_bought", CourseBoughtController);
app.get("/api/teacher_courses/:id", GetCourseByTeacherId);
app.get("/api/teacher_dashboard", GetTeacherOverview);
app.get("/api/teacher_course_accept", GetCourseTeacherAcceptController);
app.get("/api/teacher_course_reject", GetCourseTeacherRejectController);
app.get("/api/teacher_course_pending", GetCourseTeacherPendingController);
app.get("/api/teacher_purchasedbyteacher", GetCoursesPurchasedByTeacher);
app.post(
  "/api/course/:id",
  upload.single("image_course"),
  EditCourseByIdController
);
app.delete("/api/course/:id", DeleteCourseByIdController);
app.post("/api/topics", upload.single(""), CreateTopicController);
app.delete("/api/topic/:id", DeleteTopicController);
app.post("/api/video", upload.single("videoFile"), CreateVideoController);
app.post("/api/quizzes", upload.single(""), CreateQuizzController);
app.post(
  "/api/lecture",
  upload.single("file_lecture"),
  CreateLectureController
);
app.delete("/api/content/:id/:contentId/:type", DeleteContentController);
app.get("/api/role", CheckRoleUser);
app.get("/api/admin/course_pending", GetCoursePendingController);
app.get("/api/admin/course_accept", GetCourseAcceptController);
app.post(
  "/api/admin/course_request_status",
  ResponseRequestCourseToUserController
);
app.get("/api/admin/course_teacher", GetAllCourseByTeacher);
app.get("/api/notifications", GetNotificationController);
app.post("/api/read-notification", ReadedNotificationController);
app.get("/api/admin/users", GetAllUserController);
app.get("/api/admin/overview", GetStatisticOverview);
app.post("/api/admin/role", SetRoleUser);
app.post("/api/cart/add", AddToCartController);
app.get("/api/cart", GetCartController);
app.post("/api/checkout/create-session", CreateCheckoutController);
app.post("/api/topic/checkout/create-session", CreateCheckoutTopicController);
app.get("/api/checkout/session", GetSessionController);
app.delete("/api/cart/remove", RemoveFromCartController);
app.get("/api/count_cart_item", CountCartItemsController);
app.get("/api/admin/students", GetStudentFollowCourseController);
app.get("/api/admin/courses_bought", GetCourseBoughtController);
app.get("/api/course/:id", GetPurchasedCourseDetailController);
app.post("/api/progress/:id", CompleteProgressCourseController);
app.post("/api/result_topic/:id", ResultTopicController);
app.get("/api/progress/:id", GetProgressController);
app.post("/api/download", ProvideCertificateController);
app.post("/api/verify_certificate", upload.single(""), SearchUidCertificate);
app.get("/api/quizzes/:id", GetQuizzController);
app.get("/api/comments/:courseId", GetCommentByCourseIdController);
app.get("/api/suggestion", SuggestionCoursesController);
app.get("/api/suggestion_topic/:id", SuggestionTopicController);
app.get("/api/topics/:id", GetTopicDetailController);
app.get("/api/topics_purchased", GetTopicsPurchasedController);
app.post("/api/posts", upload.single("file_path"), AddPost);
app.get("/api/posts", GetPost);
app.get("/api/comments/posts/:postId", GetCommentByPostId);
app.post("/api/post/reaction", ToggleReaction);
app.get("/api/post/check_reaction/:id", CheckDisplayReaction);
app.get("/api/count_reaction/:id", GetCountLikeForPost);
app.get("/api/recommendations/forums", getRecommendedForums);
app.post("/api/join_forum", JoinForum);
app.get("/api/forums/:id", GetForumDetail);
app.get("/api/forum/:id", GetPostForum);
app.get("/api/forum", JoinedForum);
app.delete("/api/forum/:id", QuitForum);
app.get("/api/topic_progress", GetTopicProgressController);
app.post("/api/chatbot", generateChatbotResponse);
app.get("/api/comment_forumtopic/:id", GetCommentsForumTopic)
app.get("/api/user/weak_topics",VerifyToken, GetWeakTopicsRecommendation);
// app.post(
//   "/api/topics/:id/ai-questions",
//   VerifyToken,
//   GenerateAIQuestionsForTopic
// );
// FakeUserReactionPosts()
// FakePostForUser()
// GetContentDataset();
// GetBehaviorUser()
// cleanContentDataset
// FakeUserCommentPost()
// server.listen(5000, () => {
//   console.log("Server is running on port 5000");
// });
// cleanContentDatasetWithLLM()
// cleanForumDatasetWithLLM()
// calculationSimilarityContentForum()
// calculationSimilarityBehaviorForum()
// finalSimilarity()

server.listen(5000, "0.0.0.0", () => {
  console.log("Server is running on port 5000");
});