"use client";
import React, { useEffect, useState } from "react";
import VideoPlayer from "@/app/components/share/videoplayer";
import AlertSuccess from "@/app/components/share/alert_success";
import AlertError from "@/app/components/share/alert_error";
interface Lecture {
  id: string;
  topic_id: string;
  name_lecture: string;
  content_html: string;
}

interface Video {
  id: string;
  video_title: string;
  video_url: string;
}

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

interface Topic {
  id: string;
  topic_name: string;
  topic_description: string;
  lectures: Lecture[];
  videos: Video[];
  questions: QuizQuestion[];
}

interface QuestionResult {
  question_id: string;
  is_correct: boolean;
  selected_option: string;
}

interface Quizzes {
  question_id: string;
  selected_option: string;
}
const TopicDetail = ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = React.use(params);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [watchedEnough, setWatchedEnough] = useState(false);
  const [questionResult, setQuestionResult] = useState<QuestionResult[] | null>(
    null
  );
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const [quizResultsContent, setQuizResultsContent] = useState<string>("");
  const [quizzes, setQuizzes] = useState<Quizzes[]>([]);
  const GetTopicsDetail = async () => {
    const res = await fetch(`http://localhost:5000/api/topics/${slug}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    setTopic(data.message);
  };

  const GetQuizzes = async () => {
    const res = await fetch(`http://localhost:5000/api/quizzes/${slug}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    setQuizzes(data.message[0]?.QuizAnswers || []);
  };

  useEffect(() => {
    GetTopicsDetail();
    GetQuizzes();
  }, []);

  const handleCheckQuiz = (
    event: React.MouseEvent<HTMLButtonElement>
  ): QuestionResult[] | null => {
    event.preventDefault();

    if (!topic) {
      return null;
    }

    const currentQuiz = topic.questions;
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
            <p>Giải thích: <span className="fw-medium">${
              q.explanation
            }</span></p>
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
    e.preventDefault();

    // 1. Kiểm tra đã làm quiz chưa
    if (topic && topic.questions.length > 0 && !questionResult) {
      setMessage("Vui lòng hoàn thành trắc nghiệm hoặc nộp bài lại");
      setError(true);
      setTimeout(() => setError(false), 3000);
      return;
    }

    // 2. Kiểm tra đã xem video đủ chưa
    if (
      Array.isArray(topic?.videos) &&
      topic.videos.length > 0 &&
      !watchedEnough
    ) {
      setMessage("Vui lòng xem ít nhất 80% video trước khi hoàn thành");
      setError(true);
      setTimeout(() => setError(false), 3000);
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/progress/${topicId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        setSuccess(true);
        setMessage("Hoàn thành chủ đề thành công!");
        setTimeout(() => setSuccess(false), 3000);
        // Nếu muốn load tiếp chủ đề tiếp theo, cần truyền dữ liệu topics từ props hoặc context
      } else {
        setMessage("Có lỗi xảy ra khi hoàn thành chủ đề.");
        setError(true);
        setTimeout(() => setError(false), 3000);
      }
    } catch (err) {
      console.error(err);
      setMessage("Lỗi kết nối đến server.");
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
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

  const SelectedQuestion = (questionId: string, option: string): boolean => {
    return quizzes?.some(
      (q) => q.question_id === questionId && q.selected_option === option
    );
  };

  return (
    <div>
      <main
        className="d-flex flex-column bg-light p-4 overflow-auto"
        style={{ width: "100%" }}
      >
        <section>
          <h2 className="fs-3 fw-semibold text-secondary mb-3">
            Video bài giảng
          </h2>
          <div className="ratio ratio-16x9 rounded overflow-hidden">
            {topic && topic.videos.length > 0 ? (
              topic.videos.map((video) => (
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

        <section>
          <h2 className="fs-3 fw-semibold text-secondary mb-3">
            Bài giảng chi tiết
          </h2>
          <div className="text-dark lh-base">
            {topic && topic.lectures.length > 0 ? (
              topic.lectures.map((lecture, index) => (
                <div key={lecture.id} className="mb-4">
                  <h5 className="mb-2">{lecture.name_lecture}</h5>
                  <div
                    dangerouslySetInnerHTML={{ __html: lecture.content_html }}
                  ></div>
                  {index < topic.lectures.length - 1 && <hr />}
                </div>
              ))
            ) : (
              <p className="text-muted">
                Chưa có bài giảng nào cho chủ đề này.
              </p>
            )}
          </div>
        </section>

        <section>
          <h2 className="fs-3 fw-semibold text-secondary mb-3">Trắc nghiệm</h2>
          <form className="mb-4">
            {topic && topic.questions && topic.questions.length > 0 ? (
              topic.questions.map((q, index) => (
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
                handleSendQuizz(e, slug, result);
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

        <button
          onClick={(e) => handleCompleteTopic(e, slug)}
          className="btn btn-outline-primary"
        >
          HOÀN THÀNH & HỌC BÀI TIẾP THEO
        </button>
      </main>

      {success && <AlertSuccess message="Nộp Bài Thành Công" />}
      {error && <AlertError message={message} />}
    </div>
  );
};

export default TopicDetail;
