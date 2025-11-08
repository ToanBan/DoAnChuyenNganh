"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import Loading from "../../loading";
import VideoPlayer from "@/app/components/share/videoplayer";
import AlertSuccess from "@/app/components/share/alert_success";
import AlertError from "@/app/components/share/alert_error";
import ModalTopicDetail from "@/app/components/share/modal_topic";
import {
  Lock,
  BadgeCheck,
  Download,
  Award,
  GraduationCap,
  BookOpenCheck,
  Smile,
  Info,
} from "lucide-react";
interface QuizQuestion {
  id: string;
  question_text: string;
  correct_answer: string;
  explanation: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

interface Video {
  id: string;
  video_title: string;
  video_url: string;
  topic_id: string;
}

interface Lecture {
  id: string;
  name_lecture: string;
  content_html: string;
  topic_id: string;
}

interface LearningContentItem {
  id: string;
  topic_name: string;
  videos: Video[];
  lectures: Lecture[];
  questions: QuizQuestion[];
}

interface Course {
  id: string;
  course_name: string;
  course_description: string;
  teacher: {
    id: string;
    name: string;
    avatar: string;
  };
  topics: LearningContentItem[];
}

interface QuestionResult {
  question_id: string;
  is_correct: boolean;
  selected_option: string;
}

interface Progress {
  user_id: string;
  is_completed: boolean;
}

interface TopicProgress {
  id: string;
  progresses: Progress[];
}

interface Quizzes {
  question_id: string;
  selected_option: string;
}

interface Topic {
  id: string;
  topic_name: string;
}

interface TopicSuggestion {
  topic_id: string;
  topic_name: string;
  topic_description: string;
  course_name: string;
  topic_price: string;
  tags: [];
}
const MyCourseDetail = ({ params }: { params: Promise<{ slug: string }> }) => {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [purchasedId, setPurchasedId] = useState<number[]>([]);
  const [currentTopic, setCurrentTopic] = useState<LearningContentItem | null>(
    null
  );
  const [learningContent, setLearningContent] = useState<{
    [key: string]: LearningContentItem;
  }>({});
  const [activeTopicId, setActiveTopicId] = useState<string>("intro");
  const [quizResultsContent, setQuizResultsContent] = useState<string>("");
  const [questionResult, setQuestionResult] = useState<QuestionResult[] | null>(
    null
  );
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [progress, setProgress] = useState<TopicProgress | null>(null);
  const { slug } = React.use(params);
  const [progressTopicId, setProgressTopicId] = useState<number[] | null>(null);
  const [orderedTopicIds, setOrderedTopicIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [watchedEnough, setWatchedEnough] = useState(false);
  const [selectedQuizz, setSelectedQuizz] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [quizzes, setQuizzes] = useState<Quizzes[]>([]);
  const [suggestionTopics, setSuggestionTopics] = useState<TopicSuggestion[]>(
    []
  );
  const isIntroOrCert =
    activeTopicId === "intro" || activeTopicId === "certificate";

  const loadContent = (topicId: string) => {
    const content = learningContent[topicId];
    if (topicId === "intro") {
      setCurrentTopic({
        id: "intro",
        topic_name: "Giới thiệu & Cách tính chứng chỉ",
        videos: [],
        questions: [],
        lectures: [
          {
            id: "intro-1",
            name_lecture: "Hướng dẫn học và tính tín chỉ",
            content_html: `
          <p><strong>Để nhận được chứng chỉ:</strong></p>
          <ul>
            <li>✅ Xem hết video và bài giảng của từng chủ đề.</li>
            <li>✅ Làm trắc nghiệm mỗi chủ đề (được phép làm lại).</li>
            <li>🔒 Hệ thống sẽ ghi nhận kết quả lần đầu tiên của mỗi chủ đề để xét chứng chỉ.</li>
            <li>📈 Khi hoàn thành tất cả các bài học chúng tôi sẽ xét duyệt, nếu hoàn thành thì thì bạn có thể download được chứng chỉ".</li>
          </ul>
        `,
            topic_id: "intro",
          },
        ],
      });
      setActiveTopicId(topicId);
      setQuizResultsContent("");
      return;
    }

    if (content) {
      setCurrentTopic(content);
      setActiveTopicId(topicId);
      setQuizResultsContent("");
    } else {
      setCurrentTopic(null);
    }
  };

  const GetCourseDetail = async () => {
    const res = await fetch(`http://localhost:5000/api/course/${slug}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    console.log(data);
    setCourse(data.message);
    setTopics(data.message.topics);
    if (data.message && data.message.topics) {
      const topicsMap: { [key: string]: LearningContentItem } = {};
      const orderedIds: string[] = [];

      topicsMap["intro"] = {
        id: "intro",
        topic_name: "Giới thiệu & Cách tính chứng chỉ",
        videos: [],
        lectures: [],
        questions: [],
      };
      orderedIds.push("intro");

      data.message.topics.forEach((topic: LearningContentItem) => {
        topicsMap[topic.id] = topic;
        orderedIds.push(topic.id);
      });

      topicsMap["certificate"] = {
        id: "certificate",
        topic_name: "Tải chứng chỉ",
        videos: [],
        lectures: [],
        questions: [],
      };
      orderedIds.push("certificate");
      setLearningContent(topicsMap);
      setOrderedTopicIds(orderedIds);
      loadContent(activeTopicId);
    } else {
      console.error("No topics found in course data.");
    }
  };

  const GetProgress = async () => {
    const res = await fetch(`http://localhost:5000/api/progress/${slug}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    setProgress(data.message);
    const completedTopicIds = data.message
      .filter((topic: any) => topic.progresses[0]?.is_completed === true)
      .map((topic: any) => topic.id);

    setProgressTopicId(completedTopicIds);
  };

  const GetQuizzes = async () => {
    const res = await fetch(
      `http://localhost:5000/api/quizzes/${activeTopicId}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.json();
    setQuizzes(data.message[0]?.QuizAnswers || []);
  };

  const GetSuggestionTopic = async () => {
    const res = await fetch(
      `http://localhost:5000/api/suggestion_topic/${activeTopicId}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.json();
    setSuggestionTopics(data.message);
  };
  useEffect(() => {
    GetProgress();
  }, []);

  const GetCoursePurchased = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/courses_bought", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      const coursePurchased = data.message;
      const ids = coursePurchased.map((item: any) => item.id);
      setPurchasedId(ids);

      const courseId = parseInt(slug);
      if (!ids.includes(courseId)) {
        setAuthorized(false);
        router.replace("/404");
      } else {
        setAuthorized(true);
        GetCourseDetail();
      }
    } catch (err) {
      console.error("Lỗi khi kiểm tra quyền truy cập:", err);
      router.replace("/404");
    }
  };

  useEffect(() => {
    if (slug) {
      GetCoursePurchased();
    }
  }, [slug]);

  useEffect(() => {
    if (activeTopicId) {
      GetQuizzes();
      GetSuggestionTopic();
    }
  }, [activeTopicId]);

  if (authorized === false) return null;
  if (authorized === null) return <Loading />;

  const handleCheckQuiz = (
    event: React.MouseEvent<HTMLButtonElement>
  ): QuestionResult[] | null => {
    event.preventDefault();

    if (!currentTopic) {
      return null;
    }

    const currentQuiz = currentTopic.questions;
    if (!currentQuiz || currentQuiz.length === 0) {
      setQuizResultsContent("");
      return null;
    }

    let correctCount = 0;
    let resultsHtml = '<p className="fs-5 fw-bold mb-2">Kết quả của bạn:</p>';
    let allAnswered = true;
    const resultList: QuestionResult[] = [];

    currentQuiz.forEach((q: QuizQuestion, index: number) => {
      const selectedOption = document.querySelector<HTMLInputElement>(
        `input[name="question${index}"]:checked`
      );

      const isCorrect = selectedOption?.value === q.correct_answer;

      resultList.push({
        question_id: q.id,
        is_correct: !!isCorrect,
        selected_option: selectedOption?.value || "",
      });

      if (!selectedOption) {
        allAnswered = false;
      }

      resultsHtml += `
      <div className="mb-3 p-3 rounded ${
        isCorrect
          ? "bg-success bg-opacity-10 border border-success"
          : "bg-danger bg-opacity-10 border border-danger"
      }">
          <p className="fw-semibold">${index + 1}. ${q.question_text}</p>
          <p>Đáp án của bạn: <span className="fw-medium">${
            selectedOption ? selectedOption.value : "Chưa chọn"
          }</span></p>
          <p>Đáp án đúng: <span className="fw-medium">${
            q.correct_answer
          }</span></p>
          <p>Giải thích: <span className="fw-medium">${q.explanation}</span></p>
          <p className="fw-bold ${
            isCorrect ? "text-success" : "text-danger"
          }">${isCorrect ? "Đúng!" : "Sai!"}</p>
      </div>
    `;

      if (isCorrect) correctCount++;
    });

    setQuestionResult(resultList);

    if (!allAnswered) {
      setMessage("Vui lòng trả lời tất cả các câu hỏi trước khi nộp bài.");
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 3000);
      return null;
    }

    resultsHtml += `<p className="fs-4 fw-bold mt-4">Bạn đã trả lời đúng ${correctCount} trên ${currentQuiz.length} câu.</p>`;
    setQuizResultsContent(resultsHtml);
    return resultList;
  };

  const handleSendQuizz = async (
    e: React.FormEvent<HTMLButtonElement>,
    topicId: string,
    resultList: QuestionResult[]
  ) => {
    e.preventDefault();
    const res = await fetch(
      `http://localhost:5000/api/result_topic/${topicId}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ questionResult: resultList }),
      }
    );
    if (res.status === 200) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }
  };

  const handleCompleteTopic = async (
    e: React.FormEvent<HTMLButtonElement>,
    topicId: string
  ) => {
    if (
      activeTopicId &&
      Array.isArray(currentTopic?.questions) &&
      currentTopic.questions.length > 0 &&
      !questionResult
    ) {
      setMessage("Vui lòng hoàn thành trắc nghiệm hoặc nộp bài lại");
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 3000);
      return;
    }

    if (
      Array.isArray(currentTopic?.videos) &&
      currentTopic.videos.length > 0 &&
      !watchedEnough
    ) {
      setMessage("Vui lòng xem ít nhất 80% video trước khi hoàn thành");
      setError(true);
      setTimeout(() => setError(false), 3000);
      return;
    }
    const res = await fetch(`http://localhost:5000/api/progress/${topicId}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      GetProgress();
      const currentIndex = topics.findIndex((t) => t.id === topicId);
      const nextTopic = topics[currentIndex + 1];
      if (nextTopic) {
        setActiveTopicId(nextTopic.id);
        loadContent(nextTopic.id);
      }
    }
  };

  const handleDownloadCertificate = async (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slug }),
      credentials: "include",
    });

    if (!res.ok) return alert("Tải thất bại!");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificate-${slug}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const SelectedQuestion = (questionId: string, option: string): boolean => {
    return quizzes?.some(
      (q) => q.question_id === questionId && q.selected_option === option
    );
  };

  const handleSelect = (questionId: string, selectedOption: string) => {
    setQuizzes((prev) => {
      const existing = prev.find((q) => q.question_id === questionId);
      if (existing) {
        return prev.map((q) =>
          q.question_id === questionId
            ? { ...q, selected_option: selectedOption }
            : q
        );
      } else {
        return [
          ...prev,
          { question_id: questionId, selected_option: selectedOption },
        ];
      }
    });
  };

  return (
    <div className="d-flex vh-100 overflow-hidden">
      <aside className="col-md-3 col-lg-2 bg-white text-dark p-4 d-flex flex-column border rounded shadow-lg overflow-auto">
        <h2 className="fs-5 fw-bold mb-4 text-center text-primary text-uppercase border-bottom pb-2">
          Chủ đề học tập
        </h2>
        <nav>
          <ul className="nav flex-column gap-2">
            {orderedTopicIds.map((topicId, index, array) => {
              const isCompleted =
                progressTopicId?.includes(Number(topicId)) ?? false;

              const isUnlocked =
                topicId === "intro" ||
                index === 1 ||
                isCompleted ||
                (index > 1 &&
                  progressTopicId?.includes(Number(array[index - 1])));

              return (
                <li
                  key={topicId}
                  className={`nav-item topic-item rounded px-3 py-2 d-flex align-items-center transition ${
                    activeTopicId === topicId
                      ? "bg-primary text-white fw-semibold shadow-sm"
                      : "bg-light text-dark border"
                  } ${!isUnlocked ? "opacity-50 cursor-not-allowed" : ""}`}
                  role="button"
                  onClick={() => {
                    if (isUnlocked) {
                      loadContent(topicId);
                    }
                  }}
                >
                  <i className="fas fa-book me-2 text-primary"></i>
                  <span className="flex-grow-1 d-flex justify-content-between align-items-center">
                    <span>{learningContent[topicId].topic_name}</span>
                    {!isUnlocked && (
                      <Lock size={18} className="ms-2 text-muted" />
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <main className="col-md-9 col-lg-10 d-flex flex-column bg-light p-4 overflow-auto">
        <h1 className="display-4 fw-bolder text-dark mb-4 text-center">
          {currentTopic
            ? currentTopic.topic_name
            : "Chọn một chủ đề để bắt đầu học!"}
        </h1>

        <section
          className={`bg-white p-4 rounded shadow mb-4 ${
            !isIntroOrCert && currentTopic ? "" : "d-none"
          }`}
        >
          <h2 className="fs-3 fw-semibold text-secondary mb-3">
            Video bài giảng
          </h2>
          <div className="ratio ratio-16x9 rounded overflow-hidden">
            {currentTopic && currentTopic.videos.length > 0 ? (
              currentTopic.videos.map((video) => (
                <VideoPlayer
                  key={video.id}
                  videoUrl={`http://localhost:5000/uploads/${video.video_url}`}
                  onWatchedEnough={() => setWatchedEnough(true)}
                />
              ))
            ) : (
              <p className="text-muted text-center my-3">
                Chưa có video cho chủ đề này.
              </p>
            )}
          </div>
        </section>

        <section
          className={`bg-white p-4 rounded shadow mb-4 ${
            !isIntroOrCert && currentTopic ? "" : "d-none"
          }`}
        >
          <h2 className="fs-3 fw-semibold text-secondary mb-3">
            Bài giảng chi tiết
          </h2>
          <div className="text-dark lh-base">
            {currentTopic && currentTopic.lectures.length > 0 ? (
              currentTopic.lectures.map((lecture, index) => (
                <div key={lecture.id} className="mb-4">
                  <h5 className="mb-2">{lecture.name_lecture}</h5>
                  <div
                    dangerouslySetInnerHTML={{ __html: lecture.content_html }}
                  ></div>
                  {index < currentTopic.lectures.length - 1 && <hr />}
                </div>
              ))
            ) : (
              <p className="text-muted">
                Chưa có bài giảng nào cho chủ đề này.
              </p>
            )}
          </div>
        </section>

        <section
          className={`bg-white p-4 rounded shadow mb-4 ${
            !isIntroOrCert && currentTopic ? "" : "d-none"
          }`}
        >
          <h2 className="fs-3 fw-semibold text-secondary mb-3">Trắc nghiệm</h2>
          <form className="mb-4">
            {currentTopic &&
            currentTopic.questions &&
            currentTopic.questions.length > 0 ? (
              currentTopic.questions.map((q, index) => (
                <div key={index} className="mb-3">
                  <p className="fw-medium text-dark mb-2">
                    {index + 1}. {q.question_text}
                  </p>
                  <div className="d-flex flex-column">
                    {Object.entries(q.options).map(([key, value], i) => (
                      <div key={i} className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="radio"
                          name={`question${index}`}
                          id={`question${index}Option${key}`}
                          value={key}
                          checked={SelectedQuestion(q.id, key)}
                          onChange={() => handleSelect(q.id, key)}
                        />
                        <label
                          className="form-check-label text-secondary"
                          htmlFor={`question${index}Option${key}`}
                        >
                          {key}. {value}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted">
                Không có câu hỏi trắc nghiệm cho chủ đề này.
              </p>
            )}
          </form>
          <button
            className="btn btn-primary"
            onClick={(e) => {
              const result = handleCheckQuiz(e);
              if (result) {
                handleSendQuizz(e, activeTopicId, result);
              }
            }}
          >
            Kiểm tra đáp án
          </button>

          <div
            className={`mt-4 p-3 rounded bg-info bg-opacity-10 text-info fw-medium ${
              quizResultsContent ? "" : "d-none"
            }`}
            dangerouslySetInnerHTML={{ __html: quizResultsContent }}
          ></div>
        </section>

        {isIntroOrCert && currentTopic && activeTopicId === "intro" && (
          <section className="bg-white p-5 rounded shadow mb-5 border border-info-subtle border-2">
            <div className="text-center mb-5">
              <GraduationCap size={64} className="text-primary mb-3" />
              <h1 className="fw-bold text-primary display-5 mb-3">
                Chào mừng bạn đến với khóa học!
              </h1>
              <p className="text-muted fs-5">
                Hãy đọc kỹ hướng dẫn dưới đây để có trải nghiệm học tập hiệu quả
                và nhận chứng chỉ.
              </p>
            </div>

            <div className="row justify-content-center">
              <div className="col-md-10 col-lg-8">
                <div className="bg-light p-4 rounded-4 border border-secondary-subtle shadow-sm">
                  {currentTopic.lectures.map((lecture, index) => (
                    <div key={lecture.id} className="mb-5">
                      <h4 className="text-dark fw-semibold mb-3 border-bottom pb-2 d-flex align-items-center gap-2">
                        <Info size={20} className="text-primary" />
                        {lecture.name_lecture}
                      </h4>
                      <div
                        className="text-secondary lh-lg fs-6"
                        dangerouslySetInnerHTML={{
                          __html: lecture.content_html,
                        }}
                      />
                    </div>
                  ))}

                  <div className="mt-4">
                    <div className="d-flex flex-column gap-3">
                      <div className="d-flex align-items-center gap-2">
                        <BookOpenCheck className="text-success" size={20} />
                        <span className="text-success fw-medium">
                          Hoàn thành video và bài giảng từng chủ đề
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <Smile className="text-warning" size={20} />
                        <span className="text-warning fw-medium">
                          Làm trắc nghiệm và đạt yêu cầu
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <GraduationCap className="text-primary" size={20} />
                        <span className="text-primary fw-medium">
                          Nhận chứng chỉ sau khi hoàn tất
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {isIntroOrCert && currentTopic && activeTopicId === "certificate" && (
          <section className="bg-white p-5 rounded shadow mb-5 border border-success-subtle border-2">
            <div className="text-center mb-5">
              <Award size={64} className="text-success mb-3" />
              <h1 className="fw-bold text-success display-5 mb-3">
                Chúc mừng bạn đã hoàn thành khóa học!
              </h1>
              <p className="text-muted fs-5">
                Hãy tự hào về thành tích của bạn và tải chứng chỉ bên dưới.
              </p>
            </div>

            <div className="row justify-content-center">
              <div className="col-md-10 col-lg-8">
                <div className="bg-light p-5 rounded-4 border border-1 border-secondary-subtle text-center shadow-sm">
                  <h2 className="fw-semibold text-dark mb-4">
                    Chứng Chỉ Hoàn Thành
                  </h2>
                  <p className="text-secondary fs-5 mb-4">
                    Đây là minh chứng cho quá trình học tập và nỗ lực của bạn!
                  </p>

                  <a
                    href="#"
                    onClick={handleDownloadCertificate}
                    className="btn btn-lg btn-success px-5 py-3 fs-5 d-inline-flex align-items-center gap-2 rounded-pill shadow"
                  >
                    <Download size={20} /> Tải Chứng Chỉ PDF
                  </a>

                  <p className="text-muted mt-3 fst-italic">
                    * Chứng chỉ ở định dạng PDF, phù hợp để in hoặc chia sẻ.
                  </p>

                  <hr className="my-5" />

                  <div className="d-flex justify-content-center gap-3 flex-wrap mt-4">
                    <span className="badge bg-primary-subtle text-primary fs-6 p-2 px-3 rounded-pill d-flex align-items-center gap-1">
                      <BadgeCheck size={16} /> Hoàn tất tất cả chủ đề
                    </span>
                    <span className="badge bg-success-subtle text-success fs-6 p-2 px-3 rounded-pill d-flex align-items-center gap-1">
                      <Award size={16} /> Sẵn sàng nhận chứng chỉ
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {progressTopicId?.includes(Number(activeTopicId)) ||
        activeTopicId === "intro" ? (
          <button className="btn btn-outline-success" disabled>
            ĐÃ HỌC XONG
          </button>
        ) : (
          <button
            onClick={(e) => handleCompleteTopic(e, activeTopicId)}
            className="btn btn-outline-primary"
          >
            HOÀN THÀNH & HỌC BÀI TIẾP THEO
          </button>
        )}

        <div className="container py-5">
          {Array.isArray(suggestionTopics) && suggestionTopics.length > 0 ? (
            <>
              <h2 className="mb-4 text-primary fw-bold">
                📘 Gợi ý chủ đề để cải thiện kỹ năng
              </h2>
              <div className="row g-4">
                {suggestionTopics.map((topic) => (
                  <div key={topic.topic_id} className="col-md-6 col-lg-4">
                    <div className="card h-100 shadow-sm border-0 rounded-4">
                      <div className="card-body">
                        <h5 className="card-title text-dark fw-bold">
                          {topic.topic_name}
                        </h5>
                        <p className="text-muted mb-2">
                          <i className="bi bi-journal-bookmark"></i>
                          Khóa học: <strong>#{topic.course_name}</strong>
                        </p>
                        <p className="fw-semibold mb-1">
                          Mô Tả: {topic.topic_description}
                        </p>

                        <p className="fw-semibold mb-1">
                          Giá:{" "}
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(Number(topic.topic_price))}
                        </p>
                        <p className="fw-semibold mb-1">📌 Tags liên quan:</p>
                        <div className="d-flex flex-wrap">
                          {topic.tags?.map((tag, index) => (
                            <span
                              key={index}
                              className="badge bg-primary text-white me-2 mb-2"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="d-flex mt-3">
                          
                          <ModalTopicDetail topicId={topic.topic_id} slug={slug} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p></p>
          )}
        </div>
      </main>

      {success && <AlertSuccess message="Nộp Bài Thành Công" />}
      {error && <AlertError message={message} />}
    </div>
  );
};

export default MyCourseDetail;
