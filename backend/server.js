const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const app = express();
const pool = require("./config/database");
const fs = require("fs");
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
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
  CheckRoleUser
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
  GetStudentsTeacherController
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
  ProvideCertificateController
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
  GetTopicsPurchasedController
} = require("./controllers/CourseController");

const {AddToCartController, GetCartController, RemoveFromCartController, CountCartItemsController} = require("./controllers/CartController")
const {GetNotificationController, ReadedNotificationController} = require("./controllers/Notification")
const {CreateCheckoutController, GetSessionController, handleTransactionSuccess, CreateCheckoutTopicController} = require("./controllers/CheckoutController")
const {AddCommentController, GetCommentByCourseIdController} = require("./controllers/CommentController")
app.post("/api/webhook", express.raw({ type: 'application/json' }), handleTransactionSuccess);
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

const upload = multer({storage});

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
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("new_comment", (data) => {
    AddCommentController(io, socket, data);
  });
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
app.get("/api/teacher_students", GetStudentsTeacherController)
app.get("/api/courses", GetCourseController);
app.post("/api/courses/search", SearchCourseController);
app.get("/api/courses/:id", GetCourseByIdController);
app.get("/api/courses_bought", CourseBoughtController);
app.get("/api/teacher_courses/:id", GetCourseByTeacherId);
app.get("/api/teacher_dashboard", GetTeacherOverview);
app.get("/api/teacher_course_accept", GetCourseTeacherAcceptController)
app.get("/api/teacher_course_reject", GetCourseTeacherRejectController)
app.get("/api/teacher_course_pending", GetCourseTeacherPendingController)
app.get("/api/teacher_purchasedbyteacher", GetCoursesPurchasedByTeacher)
app.post(
  "/api/course/:id",
  upload.single("image_course"),
  EditCourseByIdController
);
app.delete("/api/course/:id", DeleteCourseByIdController);
app.post("/api/topics", upload.single(''),CreateTopicController)
app.delete("/api/topic/:id", DeleteTopicController)
app.post("/api/video", upload.single('videoFile') ,CreateVideoController);
app.post("/api/quizzes", upload.single('') ,CreateQuizzController);
app.post("/api/lecture", upload.single('file_lecture') ,CreateLectureController);
app.delete("/api/content/:id/:contentId/:type", DeleteContentController);
app.get("/api/role", CheckRoleUser)
app.get("/api/admin/course_pending", GetCoursePendingController);
app.get("/api/admin/course_accept", GetCourseAcceptController)
app.post("/api/admin/course_request_status", ResponseRequestCourseToUserController)
app.get("/api/admin/course_teacher", GetAllCourseByTeacher)
app.get("/api/notifications", GetNotificationController);
app.post("/api/read-notification", ReadedNotificationController);
app.get("/api/admin/users", GetAllUserController);
app.get("/api/admin/overview", GetStatisticOverview)
app.post("/api/admin/role", SetRoleUser)
app.post("/api/cart/add", AddToCartController);
app.get("/api/cart", GetCartController);
app.post("/api/checkout/create-session", CreateCheckoutController);
app.post("/api/topic/checkout/create-session", CreateCheckoutTopicController);
app.get("/api/checkout/session", GetSessionController);
app.delete("/api/cart/remove", RemoveFromCartController);
app.get("/api/count_cart_item", CountCartItemsController);
app.get("/api/admin/students", GetStudentFollowCourseController);
app.get("/api/admin/courses_bought", GetCourseBoughtController);
app.get("/api/course/:id", GetPurchasedCourseDetailController)
app.post("/api/progress/:id", CompleteProgressCourseController);
app.post("/api/result_topic/:id", ResultTopicController)
app.get("/api/progress/:id", GetProgressController)
app.post("/api/download", ProvideCertificateController);
app.post("/api/verify_certificate", upload.single(""),SearchUidCertificate);
app.get("/api/quizzes/:id", GetQuizzController);
app.get("/api/comments/:courseId", GetCommentByCourseIdController)
app.get("/api/suggestion", SuggestionCoursesController)
app.get("/api/suggestion_topic/:id", SuggestionTopicController);
app.get("/api/topics/:id", GetTopicDetailController)
app.get("/api/topics_purchased", GetTopicsPurchasedController);
server.listen(5000, () => {
  console.log("Server is running on port 5000");
});