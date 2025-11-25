"use client";

import React, { useEffect, useState } from "react";

type Video = {
  id: number;
  title: string;
  url: string;
  createdAt?: string;
};

type Lecture = {
  id: number;
  name: string;
  file_path: string;
  createdAt?: string;
};

type ExtraQuestion = {
  id: number;
  question_text: string;
  options?: any; // có thể là array hoặc object {A,B,C,D}
  correct_answer?: string | null;
  explanation?: string | null;
};

type TopicResources = {
  videos: Video[];
  lectures: Lecture[];
  extra_questions: ExtraQuestion[];
};

type WeakTopic = {
  topic_id: number;
  topic_name: string | null;
  topic_description: string | null;
  course_id: number | null;
  prob_weak: number;
  accuracy: number;
  score: number;
  correct_count: number;
  total_questions: number;
  attempt_number: number;
  resources: TopicResources;
};

type ApiResponse = {
  user_id: number;
  weak_topics: WeakTopic[];
  message?: string;
};

const WeakTopicsPage: React.FC = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // lưu trạng thái "hiện đáp án" cho từng câu hỏi
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});

  const toggleAnswer = (questionId: number) => {
    setShowAnswers((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const fetchWeakTopics = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("http://localhost:5000/api/user/weak_topics", {
        method: "GET",
        credentials: "include", // gửi cookie để backend đọc token
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const msg =
          errJson?.message ||
          `Lỗi khi gọi API /api/user/weak_topics (status ${res.status})`;
        throw new Error(msg);
      }

      const json: ApiResponse = await res.json();
      setData(json);
    } catch (err: any) {
      console.error("Fetch weak_topics error:", err);
      setError(err.message || "Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeakTopics();
  }, []);

  const formatPercent = (v: number) =>
    `${(v * 100).toFixed(1).replace(".0", "")}%`;

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold text-center flex-grow-1 m-0">
          Chủ đề bạn đang yếu
        </h1>
        <button
          className="btn btn-outline-primary ms-3"
          onClick={fetchWeakTopics}
        >
          Tải lại
        </button>
      </div>

      {loading && <p>Đang tải dữ liệu gợi ý từ AI...</p>}

      {!loading && error && (
        <p className="text-danger text-center">{error}</p>
      )}

      {!loading && !error && data && data.weak_topics.length === 0 && (
        <p className="text-muted text-center">
          Hiện tại hệ thống không phát hiện chủ đề yếu rõ rệt cho bạn.
          Hãy tiếp tục học và làm bài trắc nghiệm để AI hiểu bạn hơn nhé!
        </p>
      )}

      {!loading && !error && data && data.weak_topics.length > 0 && (
        <div className="row g-4">
          {data.weak_topics.map((topic) => (
            // 👇 chuyển thành 1 cột: col-12
            <div key={topic.topic_id} className="col-12">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-primary text-white">
                  <h5 className="card-title mb-0">
                    {topic.topic_name || `Chủ đề #${topic.topic_id}`}
                  </h5>
                  {topic.topic_description && (
                    <small className="d-block mt-1 text-light">
                      {topic.topic_description}
                    </small>
                  )}
                </div>

                <div className="card-body">
                  {/* Thông tin chẩn đoán */}
                  <div className="mb-3">
                    <h6 className="fw-semibold">Đánh giá AI</h6>
                    <ul className="mb-2">
                      <li>
                        Xác suất chủ đề này là điểm yếu:{" "}
                          <strong className="text-danger">
                            {formatPercent(topic.prob_weak)}
                          </strong>
                      </li>
                      <li>
                        Độ chính xác bài làm gần nhất:{" "}
                        <strong>{formatPercent(topic.accuracy)}</strong>
                      </li>
                      <li>
                        Điểm gần nhất:{" "}
                        <strong>
                          {topic.score} / 10 (
                          {topic.correct_count}/{topic.total_questions} câu
                          đúng)
                        </strong>
                      </li>
                      <li>
                        Số lần làm: <strong>{topic.attempt_number}</strong>
                      </li>
                    </ul>
                  </div>

                  {/* Video gợi ý */}
                  <div className="mb-3">
                    <h6 className="fw-semibold">🎥 Video nên xem lại</h6>
                    {topic.resources.videos.length === 0 ? (
                      <p className="text-muted">
                        Chưa có video gợi ý cho chủ đề này.
                      </p>
                    ) : (
                      <ul>
                        {topic.resources.videos.map((v) => (
                          <li key={v.id}>
                            <a
                              href={v.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-decoration-none"
                            >
                              {v.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Tài liệu / Lecture */}
                  <div className="mb-3">
                    <h6 className="fw-semibold">📄 Tài liệu / Bài giảng</h6>
                    {topic.resources.lectures.length === 0 ? (
                      <p className="text-muted">
                        Chưa có tài liệu gợi ý thêm cho chủ đề này.
                      </p>
                    ) : (
                      <ul>
                        {topic.resources.lectures.map((l) => (
                          <li key={l.id}>
                            <a
                              href={l.file_path}
                              target="_blank"
                              rel="noreferrer"
                              className="text-decoration-none"
                            >
                              {l.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Câu hỏi luyện tập thêm */}
                  <div className="mb-2">
                    <h6 className="fw-semibold">📝 Câu hỏi luyện tập thêm</h6>
                    {topic.resources.extra_questions.length === 0 ? (
                      <p className="text-muted">
                        Chưa có câu hỏi luyện tập thêm cho chủ đề này.
                      </p>
                    ) : (
                      <ul className="ps-3">
                        {topic.resources.extra_questions.map((q) => {
                          // Chuẩn hoá options: array hoặc object {A,B,C,D}
                          let optionEntries: { key: string; value: string }[] =
                            [];

                          if (q.options) {
                            if (Array.isArray(q.options)) {
                              optionEntries = q.options.map(
                                (opt: string, idx: number) => ({
                                  key: String.fromCharCode(65 + idx), // A,B,C,D
                                  value: opt,
                                })
                              );
                            } else if (typeof q.options === "object") {
                              optionEntries = Object.entries(q.options).map(
                                ([key, value]: [string, any]) => ({
                                  key,
                                  value: String(value),
                                })
                              );
                            }
                          }

                          const correctLetter = q.correct_answer || "";
                          const correctOption = optionEntries.find(
                            (opt) => opt.key === correctLetter
                          );

                          const isShown = !!showAnswers[q.id];

                          return (
                            <li key={q.id} className="mb-3">
                              <div className="fw-semibold mb-1">
                                {q.question_text}
                              </div>

                              {optionEntries.length > 0 && (
                                <ul className="mb-2">
                                  {optionEntries.map((opt) => (
                                    <li key={opt.key}>
                                      {opt.key}. {opt.value}
                                    </li>
                                  ))}
                                </ul>
                              )}

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary mb-2"
                                onClick={() => toggleAnswer(q.id)}
                              >
                                {isShown ? "Ẩn đáp án" : "Xem đáp án"}
                              </button>

                              {isShown && (
                                <>
                                  {correctLetter && (
                                    <div className="mt-1">
                                      <span className="badge bg-success">
                                        Đáp án đúng: {correctLetter}
                                        {correctOption
                                          ? ` – ${correctOption.value}`
                                          : ""}
                                      </span>
                                    </div>
                                  )}

                                  {q.explanation && (
                                    <div className="text-muted fst-italic mt-1">
                                      Giải thích: {q.explanation}
                                    </div>
                                  )}
                                </>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeakTopicsPage;