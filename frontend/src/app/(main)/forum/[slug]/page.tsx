"use client";
import React, { use, useState, useEffect } from "react";
import socket from "@/lib/socket";
import SidebarForum from "@/app/components/share/siderbar_forum";
import CommentForum from "@/app/components/share/CommentForum";

interface Comment {
  id: number;
  postId: number;
  userId: number;
  user?: { username: string; avatar?: string };
  content: string;
  parentId?: number | null;
  forumTopicId: string;
  createdAt?: string;
  children?: Comment[];
}

interface TopicProps {
  id: string;
  title: string;
  description: string | null;
  type: string;
  week?: number;
  createdAt: string;
  questionnaires?: Array<{
    id: number;
    question: string;
    options: string[];
    answer?: string;
  }>;
}

interface ForumProps {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  tags?: string[];
  topics: TopicProps[];
}

interface ForumDetail {
  userId: string;
  forumId: string;
  forum: ForumProps;
}

const ForumRecommendation = ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = use(params);
  const [forum, setForum] = useState<ForumDetail | null>(null);
  const [expandedForms, setExpandedForms] = useState<Set<string>>(new Set());
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [content, setContent] = useState("");
  const [replyId, setReplyId] = useState(null);
  const [comments, setComments] = useState<Comment[]>([]);

  const GetForum = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/forums/${slug}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      setForum(data.message);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (slug) GetForum();
  }, [slug]);


  // ================================
  // ⭐ HÀM XÁC ĐỊNH ĐÁP ÁN ĐÚNG
  // ================================
  const getCorrectIndex = (questionnaire: any) => {
    if (!questionnaire || !Array.isArray(questionnaire.options)) return -1;

    const answerRaw = questionnaire.answer?.trim();
    if (!answerRaw) return -1;

    // Case 1: "A" | "B" | "C" | "D"
    if (/^[A-D]$/i.test(answerRaw)) {
      return answerRaw.toUpperCase().charCodeAt(0) - 65;
    }

    // Case 2: "A. JavaScript", "B) Python"
    const matchLetter = answerRaw.match(/^([A-D])[.\)]/i);
    if (matchLetter) {
      return matchLetter[1].toUpperCase().charCodeAt(0) - 65;
    }

    // Case 3: Answer là nội dung dài → so sánh includes
    const indexFull = questionnaire.options.findIndex((opt: string) =>
      opt.toLowerCase().includes(answerRaw.toLowerCase())
    );
    if (indexFull !== -1) return indexFull;

    return -1;
  };


  const toggleForm = (topicId: string) => {
    const newExpanded = new Set(expandedForms);
    newExpanded.has(topicId) ? newExpanded.delete(topicId) : newExpanded.add(topicId);
    setExpandedForms(newExpanded);
  };

  const handleOptionSelect = (topicId: string, index: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [topicId]: index }));
  };

  const JoinRoom = (forumTopicId: string) => {
    socket.emit("joinForumRoom", `forumTopic-${forumTopicId}`);
  };

  const AddCommentForumTopic = (forumTopicId: string) => {
    if (!content) return;
    const data = { forumTopicId, content, parentId: replyId };
    socket.emit("newCommentForum", data);
    setContent("");
    setReplyId(null);
  };

  if (!forum) return <p className="text-center mt-5">Đang tải...</p>;

  const groupedTopics = forum.forum.topics.reduce((acc: any, topic) => {
    const week = topic.week || 0;
    if (!acc[week]) acc[week] = [];
    acc[week].push(topic);
    return acc;
  }, {});

  Object.keys(groupedTopics).forEach((weekKey) => {
    groupedTopics[Number(weekKey)].sort((a: any, b: any) => Number(a.id) - Number(b.id));
  });

  const uniqueWeeks = Object.keys(groupedTopics)
    .map((key) => parseInt(key))
    .sort((a, b) => b - a);


  // ================================
  // ⭐ RENDER UI
  // ================================
  return (
    <main className="bg-light min-vh-100 py-5">
      <div className="container-fluid">
        <div className="row">
          <SidebarForum forumId={forum.forumId} />

          <div className="col-lg-9">
            <div id="forum-feed-view">
              <div className="row justify-content-center">
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="fw-bold mb-0 text-primary fs-2">
                      Bảng Tin Của Diễn Đàn: {forum.forum.name}
                    </h1>
                  </div>

                  <div className="row g-4">
                    {uniqueWeeks.map((week) => (
                      <div key={week} className="col-12">
                        <div className="d-flex align-items-center mb-4 pb-2 border-bottom border-primary border-2">
                          <h3 className="fw-bold mb-0 text-primary">
                            Tuần {week}: {forum.forum.name}
                          </h3>
                        </div>

                        <div className="row g-4 mb-5">
                          {groupedTopics[week].map((topic: TopicProps) => {
                            const isFormExpanded = expandedForms.has(topic.id);
                            const questionnaire = topic.questionnaires?.[0];
                            const selectedIndex = selectedAnswers[topic.id];
                            const correctIndex = questionnaire ? getCorrectIndex(questionnaire) : -1;
                            const isCorrect =
                              selectedIndex !== undefined && selectedIndex === correctIndex;
                            const hasFeedback =
                              selectedIndex !== undefined &&
                              questionnaire &&
                              correctIndex !== -1;

                            return (
                              <div key={topic.id} className="col-12">
                                <article className="card h-100 shadow-sm border-0 overflow-hidden position-relative">
                                  <div className="card-body p-4">

                                    <div className="mb-3">
                                      <span className="badge bg-primary-subtle text-primary px-3 py-2">
                                        {topic.type === "quiz" ? "Câu Hỏi Quiz" : "Thảo Luận"}
                                      </span>
                                    </div>

                                    <h2 className="card-title fw-bold mb-3 fs-4 text-dark">
                                      {topic.title}
                                    </h2>

                                    {/* ⭐ Quiz UI */}
                                    {topic.type === "quiz" && questionnaire ? (
                                      <div className="mt-3 p-3 bg-white rounded border">
                                        <h6 className="fw-bold text-primary mb-2">Các lựa chọn:</h6>
                                        <ul className="list-unstyled mb-0">
                                          {questionnaire.options.map((opt, index) => {
                                            const label = String.fromCharCode(65 + index);
                                            const isSelected = selectedIndex === index;
                                            const isCorrectOption = index === correctIndex;

                                            return (
                                              <li
                                                key={index}
                                                className={`mb-2 p-2 border rounded cursor-pointer ${
                                                  isSelected
                                                    ? isCorrect
                                                      ? "bg-success bg-opacity-10 border-success"
                                                      : "bg-danger bg-opacity-10 border-danger"
                                                    : hasFeedback && isCorrectOption
                                                    ? "bg-success bg-opacity-10 border-success"
                                                    : "hover:bg-light"
                                                }`}
                                                onClick={() => handleOptionSelect(topic.id, index)}
                                              >
                                                <strong>{label}.</strong> {opt}
                                                {hasFeedback &&
                                                  isCorrectOption &&
                                                  !isSelected && (
                                                    <small className="text-success ms-2">
                                                      (Đáp án đúng)
                                                    </small>
                                                  )}
                                              </li>
                                            );
                                          })}
                                        </ul>

                                        {hasFeedback && (
                                          <div
                                            className={`mt-3 p-2 rounded ${
                                              isCorrect
                                                ? "bg-success bg-opacity-10 text-success"
                                                : "bg-danger bg-opacity-10 text-danger"
                                            }`}
                                          >
                                            <strong>
                                              {isCorrect ? "🎉 Đúng!" : "❌ Sai!"}
                                            </strong>{" "}
                                            {!isCorrect &&
                                              `Đáp án đúng: ${String.fromCharCode(
                                                65 + correctIndex
                                              )}`}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <p className="text-secondary">{topic.description}</p>
                                    )}

                                    <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                                      <button
                                        className="btn btn-link p-0 text-muted"
                                        onClick={() => {
                                          toggleForm(topic.id);
                                          JoinRoom(topic.id);
                                        }}
                                      >
                                        {isFormExpanded ? "Ẩn form" : "Bình luận"}
                                      </button>

                                      <button className="btn btn-primary px-4 py-2 rounded-pill">
                                        Đọc thêm
                                      </button>
                                    </div>
                                  </div>

                                  {isFormExpanded && (
                                    <div className="card-footer bg-light border-0 p-0">
                                      <div className="p-4 border-top">
                                        <textarea
                                          value={content}
                                          onChange={(e) => setContent(e.target.value)}
                                          className="form-control"
                                          placeholder="Viết bình luận..."
                                        ></textarea>

                                        <button
                                          onClick={() => AddCommentForumTopic(topic.id)}
                                          className="btn btn-primary mt-3"
                                        >
                                          Gửi bình luận
                                        </button>
                                      </div>

                                      <CommentForum
                                        commentsInit={comments}
                                        forumTopicId={topic.id}
                                      />
                                    </div>
                                  )}
                                </article>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};

export default ForumRecommendation;
