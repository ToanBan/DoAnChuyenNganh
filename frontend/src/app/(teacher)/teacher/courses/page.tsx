"use client";
import React, { useState, useEffect, useRef } from "react";
import NavigationAdmin_Teacher from "@/app/components/share/NavigationAdmin";
import {
  faBook,
  faFolderPlus,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  BookOpen,
  Video,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
  Pencil,
  CheckCircle,
  Banknote,
} from "lucide-react";
import AlertSuccess from "@/app/components/share/alert_success";

interface Course {
  id: string;
  course_name: string;
  course_description: string;
  topics: Topic[];
  price: string;
  what_you_will_learn: string;
}

interface Topic {
  id: string;
  topic_name: string;
  topic_description: string;
  content: ContentItemType[];
}

interface VideoContent {
  id: string;
  type: "video";
  video_title: string;
  video_url: string;
}

interface TextContent {
  id: string;
  type: "text";
  name_lecture: string;
  content_html: string;
}

interface QuizContent {
  id: string;
  type: "quiz";
  question_text: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: number;
}

type ContentItemType = VideoContent | TextContent | QuizContent;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

interface CourseCardProps {
  course: Course;
  onDeleteCourse: (courseId: string) => void;
  onDeleteTopic: (courseId: string, topicId: string) => void;
  onDeleteContent: (
    courseId: string,
    topicId: string,
    contentId: string
  ) => void;
  selectedCourseId: string;
  selectedTopicId: string;
  setShowEditCourseModal: (value: boolean) => void;
  setCourseToEdit: (course: Course) => void;
}

interface TopicCardProps {
  courseId: string;
  topic: Topic;
  onDeleteTopic: (courseId: string, topicId: string) => void;
  onDeleteContent: (
    courseId: string,
    topicId: string,
    contentId: string
  ) => void;
  selectedTopicId: string;
}

interface ContentItemProps {
  item: ContentItemType;
  courseId: string;
  topicId: string;
  onDeleteContent: (
    courseId: string,
    topicId: string,
    contentId: string
  ) => void;
}

// Generic Modal Component
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1040 }}
      aria-modal="true"
      role="dialog"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 shadow-lg">
          <div className="modal-header border-bottom-0 pb-0">
            <h5 className="modal-title text-primary fw-bold">{title}</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body pt-0">{children}</div>
        </div>
      </div>
    </div>
  );
};

// Confirmation Modal Component
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xác nhận">
      <p className="text-muted mb-4">{message}</p>
      <div className="d-flex justify-content-end">
        <button
          type="button"
          className="btn btn-outline-secondary me-2"
          onClick={onClose}
        >
          Hủy
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          Xác nhận xóa
        </button>
      </div>
    </Modal>
  );
};

const CourseTeacherPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [newTopicTitle, setNewTopicTitle] = useState<string>("");
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [textLessonTitle, setTextLessonTitle] = useState<string>("");
  const [textLessonContent, setTextLessonContent] = useState<string>("");
  const [quizQuestion, setQuizQuestion] = useState<string>("");
  const [quizOptions, setQuizOptions] = useState<string[]>(["", "", "", ""]); // Max 4 options for simplicity
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<string>("");
  const [showCourseModal, setShowCourseModal] = useState<boolean>(false);
  const [showTopicModal, setShowTopicModal] = useState<boolean>(false);
  const [showContentModal, setShowContentModal] = useState<boolean>(false);
  const [showEditCourseModal, setShowEditCourseModal] =
    useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  const [confirmationAction, setConfirmationAction] = useState<
    (() => void) | null
  >(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string>("");
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [stringSuccess, setStringSuccess] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const successMessages: { [key: string]: string } = {
    course: "Thêm Khóa Học Thành Công",
    topic: "Thêm Chủ Đề Thành Công",
    video: "Thêm Video Thành Công",
    lecture: "Thêm Bài Giảng Thành Công",
    editCourse: "Chỉnh Sửa Khóa Học Thành Công",
    editTopic: "Chỉnh Sửa Chủ Đề Thành Công",
    deleteTopic: "Xóa Chủ Đề Thành Công",
    createQuizz: "Thêm Câu Hỏi Thành Công",
    deleteContent: "Xóa Nội Dung Thành Công",
  };

  useEffect(() => {
    const storedId = localStorage.getItem("teacherId");
    if (storedId !== null) {
      setTeacherId(storedId);
    }
  }, [teacherId]);

  const GetCourseTeacherById = async () => {
    const res = await fetch(
      `http://localhost:5000/api/teacher_courses/${teacherId}`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    const data = await res.json();
    setCourses(data.message);
  };

  useEffect(() => {
    if (teacherId) {
      GetCourseTeacherById();
    }
  }, [teacherId]);

  const handleAddCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    if (teacherId) {
      formData.append("teacherId", teacherId);
    }
    const res = await fetch("http://localhost:5000/api/courses", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    if (res.status === 200) {
      setShowCourseModal(false);
      setStringSuccess("course");
      setAlertSuccess(true);
      setTimeout(() => {
        setAlertSuccess(false);
        setStringSuccess("");
      }, 3000);
      GetCourseTeacherById();
    }
  };

  const handleEditCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const res = await fetch(
      `http://localhost:5000/api/course/${courseToEdit?.id}`,
      {
        method: "POST",
        body: formData,
        credentials: "include",
      }
    );
    if (res.status === 200) {
      setShowEditCourseModal(false);
      setStringSuccess("editCourse");
      setAlertSuccess(true);
      setTimeout(() => {
        setAlertSuccess(false);
        setStringSuccess("");
      }, 3000);
      GetCourseTeacherById();
    }
  };

  const handleDeleteCourse = (courseIdToDelete: string): void => {
    setConfirmationMessage(
      "Bạn có chắc chắn muốn xóa khóa học này và tất cả nội dung của nó?"
    );
    setConfirmationAction(() => async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/course/${courseIdToDelete}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );
        if (res.status === 200) {
          setStringSuccess("deletecourse");
          setAlertSuccess(true);
          setTimeout(() => {
            setAlertSuccess(false);
            setStringSuccess("");
          }, 3000);
          GetCourseTeacherById();
        }
      } catch (error) {
        console.error("Lỗi khi xóa khóa học:", error);
      } finally {
        setShowConfirmationModal(false);
        setConfirmationAction(null);
      }
    });

    setShowConfirmationModal(true);
  };

  const handleCreateTopic = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const res = await fetch("http://localhost:5000/api/topics", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    if (res.status === 200) {
      setShowTopicModal(false);
      setStringSuccess("topic");
      setAlertSuccess(true);
      setTimeout(() => {
        setAlertSuccess(false);
        setStringSuccess("");
      }, 3000);
      GetCourseTeacherById();
    }
  };

  const handleDeleteTopic = (
    courseId: string,
    topicIdToDelete: string
  ): void => {
    setConfirmationMessage(
      "Bạn có chắc chắn muốn xóa chủ đề này và tất cả nội dung của nó?"
    );
    setConfirmationAction(() => async () => {
      const res = await fetch(
        `http://localhost:5000/api/topic/${topicIdToDelete}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (res.status === 200) {
        setStringSuccess("deleteTopic");
        setAlertSuccess(true);
        setTimeout(() => {
          setAlertSuccess(false);
          setStringSuccess("");
        }, 3000);
        GetCourseTeacherById();
      }
    });
    setShowConfirmationModal(true);
  };

  const handleAddVideo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const res = await fetch("http://localhost:5000/api/video", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    if (res.status === 200) {
      setShowContentModal(false);
      setStringSuccess("video");
      setAlertSuccess(true);
      setTimeout(() => {
        setAlertSuccess(false);
        setStringSuccess("");
      }, 3000);
      GetCourseTeacherById();
    }
  };

  const handleAddQuizz = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const res = await fetch("http://localhost:5000/api/quizzes", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    if (res.status === 200) {
      setShowContentModal(false);
      setStringSuccess("createQuizz");
      setAlertSuccess(true);
      setTimeout(() => {
        setAlertSuccess(false);
        setStringSuccess("");
      }, 3000);
      GetCourseTeacherById();
    }
  };

  const handleAddLecture = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const res = await fetch("http://localhost:5000/api/lecture", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const data = await res.json();
    if (res.status === 200) {
      setShowContentModal(false);
      setStringSuccess("lecture");
      setAlertSuccess(true);
      setTimeout(() => {
        setAlertSuccess(false);
        setStringSuccess("");
      }, 3000);
      GetCourseTeacherById();
    }
  };

  const handleDeleteContent = (
    contentType: string,
    topicId: string,
    contentIdToDelete: string
  ): void => {
    setConfirmationMessage("Bạn có chắc chắn muốn xóa nội dung này?");
    setConfirmationAction(() => async () => {
      const res = await fetch(
        `http://localhost:5000/api/content/${topicId}/${contentIdToDelete}/${contentType}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (res.status === 200) {
        setStringSuccess("deleteContent");
        setAlertSuccess(true);
        setTimeout(() => {
          setAlertSuccess(false);
          setStringSuccess("");
        }, 3000);
        GetCourseTeacherById();
      }
    });
    setShowConfirmationModal(true);
  };

  const currentSelectedCourse = courses.find(
    (c) => c.id.toString() === selectedCourseId
  );

  return (
    <>
      <NavigationAdmin_Teacher />
      <div className="content">
        <div className="container-fluid py-4" style={{ minHeight: "100vh" }}>
          <h1
            className="text-center text-primary mb-5 fw-bold"
            style={{
              fontSize: "2.5rem",
              textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <BookOpen
              className="d-inline-block me-3 text-secondary"
              size={48}
            />
            Hệ thống Quản lý Khóa học
          </h1>

          <div style={{ maxWidth: "1200px" }}>
            <div>
              <div className="card shadow-lg border-0 rounded-4 p-4 h-100">
                <h2
                  className="text-primary mb-4 pb-3 border-bottom border-light fw-bold"
                  style={{ fontSize: "2rem" }}
                >
                  Thêm Mới Nội Dung
                </h2>

                <div className="d-flex gap-3">
                  <a
                    onClick={() => setShowCourseModal(true)}
                    href="#"
                    className="modern-button btn-course"
                  >
                    <FontAwesomeIcon icon={faBook} />
                    <span> Thêm Khóa Học</span>
                  </a>

                  <a
                    onClick={() => setShowTopicModal(true)}
                    href="#"
                    className="modern-button btn-topic"
                  >
                    <FontAwesomeIcon icon={faFolderPlus} />
                    <span> Thêm Chủ Đề</span>
                  </a>

                  <a
                    onClick={() => setShowContentModal(true)}
                    href="#"
                    className="modern-button btn-lecture"
                  >
                    <FontAwesomeIcon icon={faVideo} />
                    <span> Thêm Bài Giảng & Video</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Display Courses */}
            <div className="mt-5">
              <div className="card shadow-lg border-0 rounded-4 p-4 h-100">
                <h2
                  className="text-primary mb-4 pb-3 border-bottom border-light fw-bold"
                  style={{ fontSize: "2rem" }}
                >
                  Cấu trúc Khóa học
                </h2>
                {courses.length === 0 ? (
                  <p className="text-muted text-center py-5">
                    Chưa có khóa học nào được thêm. Hãy bắt đầu bằng cách thêm
                    một khóa học mới!
                  </p>
                ) : (
                  <div className="d-grid gap-3">
                    {courses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        onDeleteCourse={handleDeleteCourse}
                        onDeleteTopic={handleDeleteTopic}
                        onDeleteContent={handleDeleteContent}
                        selectedCourseId={selectedCourseId}
                        selectedTopicId={selectedTopicId}
                        setShowEditCourseModal={setShowEditCourseModal}
                        setCourseToEdit={setCourseToEdit}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modals */}
          <Modal
            isOpen={showCourseModal}
            onClose={() => setShowCourseModal(false)}
            title="Thêm Khóa học Mới"
          >
            <form
              onSubmit={handleAddCourse}
              className="d-grid gap-3"
              style={{ width: "100%" }}
            >
              <div className="mb-3 mt-3" style={{ textAlign: "left" }}>
                <label htmlFor="course_name" className="form-label">
                  Tiêu đề Khóa học:
                </label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder="Ví dụ: Nhập môn Lập trình Python"
                  name="course_name"
                  required
                />
              </div>
              <div className="mb-3" style={{ textAlign: "left" }}>
                <label htmlFor="course_description" className="form-label">
                  Mô tả:
                </label>
                <textarea
                  id="newCourseDescription"
                  rows={4}
                  className="form-control rounded-3"
                  placeholder="Mô tả chi tiết về khóa học..."
                  name="course_description"
                ></textarea>
              </div>

              <div className="mb-3" style={{ textAlign: "left" }}>
                <label htmlFor="what_you_will_learn" className="form-label">
                  Lợi Ích
                </label>
                <textarea
                  id="what_you_will_learn"
                  rows={4}
                  className="form-control rounded-3"
                  placeholder="Mang Lại Cho Người Học Những Gì"
                  name="what_you_will_learn"
                  required
                ></textarea>
              </div>

              <div className="mb-3 mt-3" style={{ textAlign: "left" }}>
                <label htmlFor="price_course" className="form-label">
                  Giá Khóa Học
                </label>
                <input
                  type="number"
                  id="price_course"
                  className="form-control rounded-3"
                  placeholder="Nhập Giá Khóa Học"
                  name="price_course"
                  required
                />
              </div>
              <div className="mb-3 mt-3" style={{ textAlign: "left" }}>
                <label htmlFor="image_course" className="form-label">
                  Hình ảnh khóa học
                </label>
                <input
                  type="file"
                  id="image_course"
                  className="form-control rounded-3"
                  name="image_course"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-lg rounded-3 shadow-sm"
              >
                Thêm Khóa học
              </button>
            </form>
          </Modal>

          <Modal
            isOpen={showEditCourseModal}
            onClose={() => setShowEditCourseModal(false)}
            title="Chỉnh Sửa Khóa Học"
          >
            <form
              onSubmit={handleEditCourse}
              className="d-grid gap-3"
              style={{ width: "100%" }}
            >
              <div className="mb-3 mt-3" style={{ textAlign: "left" }}>
                <label htmlFor="course_name" className="form-label">
                  Tiêu đề Khóa học:
                </label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder="Ví dụ: Nhập môn Lập trình Python"
                  name="course_name"
                  defaultValue={courseToEdit?.course_name}
                  required
                />
              </div>
              <div className="mb-3" style={{ textAlign: "left" }}>
                <label htmlFor="course_description" className="form-label">
                  Mô tả:
                </label>
                <textarea
                  id="newCourseDescription"
                  rows={4}
                  className="form-control rounded-3"
                  placeholder="Mô tả chi tiết về khóa học..."
                  name="course_description"
                  defaultValue={courseToEdit?.course_description}
                ></textarea>
              </div>

              <div className="mb-3" style={{ textAlign: "left" }}>
                <label htmlFor="what_you_will_learn" className="form-label">
                  Lợi Ích
                </label>
                <textarea
                  id="what_you_will_learn"
                  rows={4}
                  className="form-control rounded-3"
                  placeholder="Mang Lại Cho Người Học Những Gì"
                  name="what_you_will_learn"
                  defaultValue={courseToEdit?.what_you_will_learn}
                  required
                ></textarea>
              </div>

              <div className="mb-3 mt-3" style={{ textAlign: "left" }}>
                <label htmlFor="price_course" className="form-label">
                  Giá Khóa Học
                </label>
                <input
                  type="number"
                  id="price_course"
                  className="form-control rounded-3"
                  placeholder="Nhập Giá Khóa Học"
                  name="price_course"
                  defaultValue={courseToEdit?.price}
                  required
                />
              </div>
              <div className="mb-3 mt-3" style={{ textAlign: "left" }}>
                <label htmlFor="image_course" className="form-label">
                  Hình ảnh khóa học
                </label>
                <input
                  type="file"
                  id="image_course"
                  className="form-control rounded-3"
                  name="image_course"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-lg rounded-3 shadow-sm"
              >
                Thêm Khóa học
              </button>
            </form>
          </Modal>

          <Modal
            isOpen={showTopicModal}
            onClose={() => setShowTopicModal(false)}
            title="Thêm Chủ đề vào Khóa học"
          >
            <form
              onSubmit={handleCreateTopic}
              className="d-grid gap-3"
              style={{ width: "100%" }}
            >
              <div className="mb-3 mt-2" style={{ textAlign: "left" }}>
                <label htmlFor="selectCourseForTopic" className="form-label">
                  Chọn Khóa học:
                </label>
                <select
                  id="selectCourseForTopic"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="form-select rounded-3"
                >
                  <option value="">-- Chọn Khóa học --</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.course_name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedCourseId && (
                <div className="mb-3" style={{ textAlign: "left" }}>
                  <div>
                    <label htmlFor="topic_name" className="form-label">
                      Tiêu đề Chủ đề:
                    </label>
                    <input
                      type="text"
                      id="topic_name"
                      className="form-control rounded-3"
                      placeholder="Nhập Tên Chủ Đề"
                      name="topic_name"
                      required
                    />
                  </div>

                  <div className="mt-3">
                    <label htmlFor="topic_description" className="form-label">
                      Mô Tả Chủ Đề
                    </label>
                    <input
                      type="text"
                      id="topic_description"
                      className="form-control rounded-3"
                      placeholder="Nhập Mô Tả Về Chủ Đề"
                      name="topic_description"
                    />
                  </div>

                  <div className="mt-3">
                    <input
                      type="text"
                      id="course_id"
                      className="form-control rounded-3"
                      placeholder="Nhập Mô Tả Về Chủ Đề"
                      name="course_id"
                      defaultValue={selectedCourseId}
                      hidden
                    />
                  </div>
                </div>
              )}
              <button
                type="submit"
                disabled={!selectedCourseId}
                className={`btn btn-lg rounded-3 shadow-sm ${
                  !selectedCourseId ? "btn-secondary" : "btn-success"
                }`}
              >
                Thêm Chủ đề
              </button>
            </form>
          </Modal>

          <Modal
            isOpen={showContentModal}
            onClose={() => setShowContentModal(false)}
            title="Thêm Nội dung Bài giảng/Trắc nghiệm"
          >
            <div
              className="d-grid gap-3 mt-2"
              style={{ width: "100%", textAlign: "left" }}
            >
              <form>
                <div className="mb-3">
                  <label
                    htmlFor="selectCourseForContent"
                    className="form-label"
                  >
                    Chọn Khóa học:
                  </label>
                  <select
                    id="selectCourseForContent"
                    value={selectedCourseId}
                    onChange={(e) => {
                      setSelectedCourseId(e.target.value);
                      setSelectedTopicId("");
                    }}
                    className="form-select rounded-3"
                  >
                    <option value="">-- Chọn Khóa học --</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.course_name}
                      </option>
                    ))}
                  </select>
                </div>
              </form>
              {currentSelectedCourse && (
                <div className="mb-3">
                  <label htmlFor="selectTopicForContent" className="form-label">
                    Chọn Chủ đề:
                  </label>
                  <select
                    id="selectTopicForContent"
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    className="form-select rounded-3"
                  >
                    <option value="">-- Chọn Chủ đề --</option>
                    {currentSelectedCourse.topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.topic_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedTopicId && (
                <div className="d-grid gap-4 mt-4">
                  {/* Video Lesson Form */}
                  <div className="card bg-danger-subtle border-danger shadow-sm rounded-3 p-3">
                    <h4 className="card-title text-danger mb-3 d-flex align-items-center">
                      <Video size={20} className="me-2" /> Thêm Video Bài giảng
                    </h4>
                    <form onSubmit={handleAddVideo} className="d-grid gap-3">
                      <div className="mb-3">
                        <label htmlFor="videoTitle" className="form-label">
                          Tiêu đề Video:
                        </label>
                        <input
                          type="text"
                          id="videoTitle"
                          name="videoTitle"
                          className="form-control rounded-3"
                          placeholder="Ví dụ: Python cơ bản"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="videoFile" className="form-label">
                          Tải File
                        </label>
                        <input
                          type="file"
                          id="videoFile"
                          name="videoFile"
                          className="form-control rounded-3"
                          required
                        />
                      </div>

                      <input
                        type="text"
                        hidden
                        defaultValue={selectedTopicId}
                        name="topic_id"
                      />
                      <button
                        type="submit"
                        className="btn btn-danger rounded-3 shadow-sm"
                      >
                        Thêm Video
                      </button>
                    </form>
                  </div>

                  {/* Text Lesson Form */}
                  <div className="card bg-warning-subtle border-warning shadow-sm rounded-3 p-3">
                    <h4 className="card-title text-warning mb-3 d-flex align-items-center">
                      <FileText size={20} className="me-2" /> Thêm Bài giảng Văn
                      bản
                    </h4>
                    <form onSubmit={handleAddLecture} className="d-grid gap-3">
                      <div className="mb-3">
                        <label htmlFor="name_lecture" className="form-label">
                          Tiêu đề Bài giảng:
                        </label>
                        <input
                          type="text"
                          id="name_lecture"
                          name="name_lecture"
                          className="form-control rounded-3"
                          placeholder="Ví dụ: Cài đặt môi trường"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="file_lecture" className="form-label">
                          Nội dung Bài giảng:
                        </label>
                        <input
                          type="file"
                          name="file_lecture"
                          className="form-control"
                          required
                        />
                      </div>

                      <input
                        type="text"
                        hidden
                        name="topic_id"
                        defaultValue={selectedTopicId}
                      />

                      <button
                        type="submit"
                        className="btn btn-warning rounded-3 shadow-sm"
                      >
                        Thêm Bài giảng
                      </button>
                    </form>
                  </div>

                  {/* Quiz Question Form */}
                  <div className="card bg-info-subtle border-info shadow-sm rounded-3 p-3">
                    <h4 className="card-title text-info mb-3 d-flex align-items-center">
                      <HelpCircle size={20} className="me-2" /> Thêm Câu hỏi
                      Trắc nghiệm
                    </h4>
                    <form onSubmit={handleAddQuizz} className="d-grid gap-3">
                      <div className="mb-3">
                        <label htmlFor="quizQuestion" className="form-label">
                          Câu hỏi:
                        </label>
                        <textarea
                          id="quizQuestion"
                          name="quizQuestion"
                          rows={3}
                          className="form-control rounded-3"
                          placeholder="Ví dụ: Python là ngôn ngữ lập trình gì?"
                          required
                        ></textarea>
                      </div>
                      {quizOptions.map((option, index) => (
                        <div className="mb-3" key={index}>
                          <label
                            htmlFor={`option${index}`}
                            className="form-label"
                          >
                            Lựa chọn {index + 1}:
                          </label>
                          <input
                            type="text"
                            id={`option${index}`}
                            onChange={(e) => {
                              const newOptions = [...quizOptions];
                              newOptions[index] = e.target.value;
                              setQuizOptions(newOptions);
                            }}
                            name={`option${index}`}
                            className="form-control rounded-3"
                            placeholder={`Lựa chọn ${index + 1}`}
                            required
                          />
                        </div>
                      ))}
                      <div className="mb-3">
                        <label
                          htmlFor="correctAnswerIndex"
                          className="form-label"
                        >
                          Chỉ mục đáp án đúng (1, 2, 3, 4):
                        </label>
                        <input
                          type="number"
                          id="correctAnswerIndex"
                          value={correctAnswerIndex}
                          onChange={(e) =>
                            setCorrectAnswerIndex(e.target.value)
                          }
                          name="correctAnswerIndex"
                          className="form-control rounded-3"
                          placeholder="Ví dụ: 0 cho lựa chọn đầu tiên"
                          required
                          min={1}
                          max={
                            quizOptions.filter((opt) => opt).length > 0
                              ? quizOptions.filter((opt) => opt).length
                              : 0
                          }
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="explanation" className="form-label">
                          Giải Thích Đáp Án
                        </label>
                        <input
                          type="text"
                          id="explanation"
                          name="explanation"
                          className="form-control rounded-3"
                          placeholder="Giải thích câu trả lời đúng"
                        />
                      </div>

                      <input
                        type="text"
                        name="topic_id"
                        hidden
                        defaultValue={selectedTopicId}
                      />
                      <button
                        type="submit"
                        className="btn btn-info rounded-3 shadow-sm"
                      >
                        Thêm Câu hỏi
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </Modal>

          {alertSuccess && successMessages[stringSuccess] && (
            <AlertSuccess message={successMessages[stringSuccess]} />
          )}

          <ConfirmationModal
            isOpen={showConfirmationModal}
            onClose={() => setShowConfirmationModal(false)}
            onConfirm={confirmationAction as () => void} // Cast to ensure it's a function
            message={confirmationMessage}
          />
        </div>
      </div>
    </>
  );
};

// Component to display a single course and its topics/content
const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onDeleteCourse,
  onDeleteTopic,
  onDeleteContent,
  selectedCourseId,
  selectedTopicId,
  setShowEditCourseModal,
  setCourseToEdit,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <>
      <div
        className={`card bg-light border-secondary shadow-sm rounded-3 p-3 ${
          selectedCourseId === course.id ? "border border-primary border-3" : ""
        }`}
      >
        <div
          className="d-flex justify-content-between align-items-center cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h3 className="h5 fw-bold text-primary mb-0 d-flex align-items-center">
            <BookOpen size={22} className="me-3 text-secondary" />
            {course.course_name}
          </h3>
          <div className="d-flex align-items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCourse(course.id);
              }}
              className="btn btn-outline-danger btn-sm me-2 rounded-circle"
              title="Xóa Khóa học"
            >
              <Trash2 size={16} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setCourseToEdit(course);
                setShowEditCourseModal(true);
              }}
              className="btn btn-outline-danger btn-sm me-2 rounded-circle"
              title="Chỉnh Sửa Khóa Học"
            >
              <Pencil size={16} />
            </button>

            <button className="btn btn-link text-primary p-0">
              {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>
          </div>
        </div>
        {isExpanded && (
          <div className="mt-3 pt-3 border-top border-light animate-fade-in-up">
            <p className="text-muted fst-italic mb-3">
              {course.course_description}
            </p>

            <p className="text-muted fst-italic mb-3">
              <strong>Giá Tiền</strong>: {course.price}
            </p>

            <p className="text-muted fst-italic mb-3">
              <strong>Lợi Ích</strong> <br />
              {course.what_you_will_learn}
            </p>

            {!course.topics || course.topics.length === 0 ? (
              <p className="text-muted small">
                Khóa học này chưa có chủ đề nào.
              </p>
            ) : (
              <div className="d-grid gap-3">
                {course.topics.map((topic: any) => {
                  const videoContent = (topic.videos || []).map(
                    (video: any) => ({
                      id: video.id,
                      type: "video",
                      video_title: video.video_title,
                      video_url: video.video_url,
                    })
                  );

                  const textContent = (topic.lectures || []).map(
                    (text: any) => ({
                      id: text.id,
                      type: "text",
                      name_lecture: text.name_lecture,
                      content_html: text.content_html,
                    })
                  );

                  const quizContent = (topic.questions || []).map(
                    (quiz: any) => {
                      let parsedOptions = {};

                      if (typeof quiz.options === "string") {
                        try {
                          parsedOptions = JSON.parse(quiz.options); // chuyển từ string JSON về object
                        } catch (e) {
                          console.error("Không thể parse options:", e);
                        }
                      } else if (
                        typeof quiz.options === "object" &&
                        quiz.options !== null
                      ) {
                        parsedOptions = quiz.options; // đã là object
                      }

                      return {
                        id: quiz.id,
                        type: "quiz",
                        question_text: quiz.question_text,
                        options: parsedOptions,
                        correct_answer: quiz.correct_answer,
                      };
                    }
                  );

                  const transformedTopic = {
                    ...topic,
                    content: [...videoContent, ...textContent, ...quizContent],
                  };

                  return (
                    <TopicCard
                      key={transformedTopic.id}
                      courseId={course.id}
                      topic={transformedTopic}
                      onDeleteTopic={onDeleteTopic}
                      onDeleteContent={onDeleteContent}
                      selectedTopicId={selectedTopicId}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

// Component to display a single topic and its content
const TopicCard: React.FC<TopicCardProps> = ({
  courseId,
  topic,
  onDeleteTopic,
  onDeleteContent,
  selectedTopicId,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  return (
    <div
      className={`card bg-white border-info shadow-sm rounded-3 p-3 ${
        selectedTopicId === topic.id ? "border border-success border-3" : ""
      }`}
    >
      <div
        className="d-flex justify-content-between align-items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h4 className="h6 fw-bold text-success mb-0 d-flex align-items-center">
          <BookOpen size={20} className="me-2 text-success" />
          {topic.topic_name}
        </h4>
        <div className="d-flex align-items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTopic(courseId, topic.id);
            }}
            className="btn btn-outline-danger btn-sm me-2 rounded-circle"
            title="Xóa Chủ đề"
          >
            <Trash2 size={14} />
          </button>
          <button className="btn btn-link text-success p-0">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="mt-3 pt-3 border-top border-light animate-fade-in-up">
          {!topic.content || topic.content.length === 0 ? (
            <p className="text-muted small">Chủ đề này chưa có nội dung nào.</p>
          ) : (
            <div className="d-grid gap-2 mt-3">
              {topic.content.map((item) => (
                <ContentItem
                  key={`${item.type}-${item.id}`}
                  item={item}
                  courseId={courseId}
                  topicId={topic.id}
                  onDeleteContent={onDeleteContent}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ContentItem: React.FC<ContentItemProps> = ({
  item,
  courseId,
  topicId,
  onDeleteContent,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  let icon: React.ReactNode;
  let titleColorClass: string;
  let bgColorClass: string;
  let hoverBgColorClass: string;

  switch (item.type) {
    case "video":
      icon = <Video size={18} className="me-2 text-danger" />;
      titleColorClass = "text-danger";
      bgColorClass = "bg-danger-subtle";
      hoverBgColorClass = "hover-bg-danger-subtle-hover";
      break;
    case "text":
      icon = <FileText size={18} className="me-2 text-warning" />;
      titleColorClass = "text-warning";
      bgColorClass = "bg-warning-subtle";
      hoverBgColorClass = "hover-bg-warning-subtle-hover";
      break;
    case "quiz":
      icon = <HelpCircle size={18} className="me-2 text-info" />;
      titleColorClass = "text-info";
      bgColorClass = "bg-info-subtle";
      hoverBgColorClass = "hover-bg-info-subtle-hover";
      break;
    default:
      icon = null;
      titleColorClass = "text-muted";
      bgColorClass = "bg-light";
      hoverBgColorClass = "hover-bg-light-hover";
  }

  return (
    <div
      className={`card ${bgColorClass} border-secondary shadow-sm rounded-3 p-3 ${hoverBgColorClass}`}
    >
      <div
        className="d-flex justify-content-between align-items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h5
          className={`h6 fw-bold ${titleColorClass} mb-0 d-flex align-items-center`}
        >
          {icon}
          {item.type === "quiz"
            ? `[Trắc nghiệm] ${item.question_text}`
            : item.type === "text"
            ? `[Tài liệu] ${item.name_lecture}`
            : item.type === "video"
            ? `[Video] ${item.video_title}`
            : ""}
        </h5>
        <div className="d-flex align-items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteContent(item.type, topicId, item.id);
            }}
            className="btn btn-outline-danger btn-sm me-2 rounded-circle"
            title="Xóa Nội dung"
          >
            <Trash2 size={12} />
          </button>
          <button className={`btn btn-link ${titleColorClass} p-0`}>
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-top border-light animate-fade-in-up">
          {item.type === "video" && (
            <div>
              <p className="small fw-bold mb-1">🎬 {item.video_title}</p>
              <p className="small">
                URL:{" "}
                <a
                  href={item.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-decoration-none fw-bold"
                >
                  {item.video_url}
                </a>
              </p>
            </div>
          )}

          {item.type === "text" && (
            <div
              className="small text-break"
              style={{ whiteSpace: "pre-wrap" }}
              dangerouslySetInnerHTML={{ __html: item.content_html }}
            />
          )}

          {item.type === "quiz" && (
            <div>
              <ul className="list-unstyled ps-3 mt-3 small">
                {Object.entries(item.options).map(([key, value], index) => (
                  <li
                    key={`${item.id}-${key}`}
                    className={
                      key === String(item.correct_answer)
                        ? "fw-bold text-success"
                        : ""
                    }
                  >
                    {key}. {value}
                    {key === String(item.correct_answer) && (
                      <span className="badge bg-success-subtle text-success ms-2">
                        Đáp án đúng
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseTeacherPage;
