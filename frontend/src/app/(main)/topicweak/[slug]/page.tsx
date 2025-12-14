"use client";
import React, { useEffect, useState } from "react";

interface Question {
  id: number;
  question_text: string;
  options: Record<"A" | "B" | "C" | "D", string>;
  correct_answer: "A" | "B" | "C" | "D";
  explanation: string;
}

interface TopicWeakData {
  id: number;
  user_id: number;
  topic_id: number;
  lecture: string | null;
  video: string | null;
}

interface ApiResponse {
  message: string;
  data: {
    topicWeak: TopicWeakData;
    questions: Question[];
  };
}

const TopicWeakPage = ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = React.use(params);
  const [topicWeak, setTopicWeak] = useState<TopicWeakData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const fetchContentSuggesstion = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/topic_weak/${slug}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data: ApiResponse = await res.json();
        setTopicWeak(data.data.topicWeak);
        setQuestions(data.data.questions);
      } catch (err) {
        console.error("Fetch TopicWeak error:", err);
      }
    };

    fetchContentSuggesstion();
  }, [slug]);

  const handleSelectAnswer = (questionId: number, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  return (
    <>
      <style>{`
        body {
          background: #f4f7fc;
          font-family: 'Roboto', sans-serif;
          margin: 0;
          padding: 0;
        }
        .header-section {
          background-color: #4e73df;
          color: white;
          padding: 60px 0;
          text-align: center;
          border-radius: 0 0 20px 20px;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
        }
        .header-section h1 {
          font-size: 3rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .header-section p {
          font-size: 1.3rem;
          font-weight: 300;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .row {
          display: flex;
          flex-wrap: wrap;
          gap: 30px;
        }
        .col-lg-4, .col-lg-8 {
          flex: 1;
          min-width: 300px;
        }
        .download-card, .quiz-card {
          background: #ffffff;
          padding: 30px;
          border-radius: 16px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        .download-card:hover:hover {
          transform: scale(1.05);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}
        .download-btn, .btn {
          width: 100%;
          padding: 14px 22px;
          font-size: 1.2rem;
          font-weight: bold;
          border-radius: 10px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          text-align: center;
        }
        .download-btn:hover, .btn:hover {
          transform: translateY(0); /* Không thay đổi vị trí */
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
        }
        .btn-docx {
          background-color: #80c7ff;
          border-color: #80c7ff;
          color: white;
        }
        .btn-video {
          background-color: #f39c12;
          border-color: #f39c12;
          color: white;
        }
        .quiz-item {
          padding: 20px;
          margin-bottom: 20px;
          background-color: #f9f9f9;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          transition: box-shadow 0.3s ease;
        }
        .quiz-item:hover {
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1); /* Thêm hiệu ứng hover nhẹ */
        }
        .quiz-options label {
          display: block;
          margin-bottom: 10px;
          cursor: pointer;
          padding: 12px 16px;
          border-radius: 8px;
          background-color: #f2f3f5;
          transition: background-color 0.3s ease;
        }
        .quiz-options label:hover {
          background-color: #e3e6f3; /* Màu nền nhẹ khi hover */
        }
        .answer-key {
          background-color: #e6ffed;
          border: 1px solid #a3e0b8;
          padding: 20px;
          border-radius: 12px;
          margin-top: 20px;
          display: none;
        }
        .answer-key strong {
          color: #28a745;
        }
        .quiz-item input[type="radio"] {
          margin-right: 10px;
        }
        @media (max-width: 768px) {
          .header-section h1 {
            font-size: 2rem;
          }
          .container {
            padding: 10px;
          }
        }
      `}</style>

      <div className="header-section">
        <h1>Tài liệu & Bài kiểm tra</h1>
        <p>Nơi bạn có thể tải xuống tài liệu học tập và kiểm tra kiến thức của mình.</p>
      </div>

      <div className="container">
        <div className="row">
          {/* Tải tài liệu */}
          <div className="col-lg-12">
            <div className="download-card">
              {topicWeak?.lecture && (
                <a
                  href={`http://localhost:5000/uploads/${topicWeak.lecture}`}
                  download
                  className="btn download-btn btn-docx"
                >
                  <i className="fas fa-file-word me-2"></i> Tải xuống Tài liệu (.DOCX)
                </a>
              )}
              {topicWeak?.video && (
                <a
                  href={`http://localhost:5000/uploads/${topicWeak.video}`}
                  download
className="btn download-btn btn-video"
                >
                  <i className="fas fa-video me-2"></i> Tải xuống Bài giảng Video
                </a>
              )}
            </div>
          </div>

          {/* Danh sách câu hỏi trắc nghiệm */}
          <div className="col-lg-12">
            <div className="quiz-card">
              <h4 className="mb-4 text-center text-success">Danh sách Câu hỏi Trắc nghiệm</h4>
              <form id="quizForm">
                {questions.map((q, idx) => (
                  <div key={q.id} className="quiz-item">
                    <p className="fw-semibold">{idx + 1}. {q.question_text}</p>
                    <div className="quiz-options">
                      {(["A", "B", "C", "D"] as const).map(option => (
                        <label key={option}>
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            value={option}
                            checked={answers[q.id] === option}
                            onChange={() => handleSelectAnswer(q.id, option)}
                          />{" "}
                          {option}. {q.options[option]}
                        </label>
                      ))}
                    </div>
                    {showAnswer && (
                      <div className="answer-key d-block mt-2">
                        <strong>Đáp án:</strong> {q.correct_answer} <br />
                        <strong>Giải thích:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </form>

              <button
                id="showAnswerBtn"
                className="btn btn-success btn-lg mt-4 w-100"
                onClick={handleShowAnswer}
                disabled={showAnswer}
              >
                <i className="fas fa-check-circle me-2"></i> Xem Đáp án & Kết quả
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopicWeakPage;
