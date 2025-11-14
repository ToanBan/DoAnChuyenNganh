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
  forumTopicId:string;
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

const ForumRecommendation = ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = use(params);
  const [forum, setForum] = useState<ForumDetail | null>(null);
  const [expandedForms, setExpandedForms] = useState<Set<string>>(new Set());
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: number;
  }>({});
  const [content, setContent] = useState("");
  const [replyId, setReplyId] = useState(null);
  const [comments, setComments] = useState<Comment[]>([]);

  const GetForum = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/forums/${slug}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
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

 

  const toggleForm = (topicId: string) => {
    const newExpanded = new Set(expandedForms);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedForms(newExpanded);
  };

  const handleOptionSelect = (topicId: string, index: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [topicId]: index }));
  };

  const handleLeaveGroup = () => {
    if (confirm("Bạn có chắc chắn muốn rời nhóm này?")) {
      console.log("Rời nhóm:", slug);
    }
  };

  const handleViewUserPosts = () => {
    console.log("Xem posts user");
  };

  if (!forum) return <p className="text-center mt-5">Đang tải...</p>;

  const groupedTopics = forum.forum.topics.reduce(
    (acc: { [key: number]: TopicProps[] }, topic) => {
      const week = topic.week || 0;
      if (!acc[week]) {
        acc[week] = [];
      }
      acc[week].push(topic);
      return acc;
    },
    {}
  );

  Object.keys(groupedTopics).forEach((weekKey) => {
    groupedTopics[Number(weekKey)].sort((a, b) => {
      return Number(a.id) - Number(b.id);
    });
  });

  const uniqueWeeks = Object.keys(groupedTopics)
    .map((key) => parseInt(key))
    .sort((a, b) => b - a);

  const JoinRoom = (forumTopicId: string) => {
    socket.emit("joinForumRoom", `forumTopic-${forumTopicId}`);
  };

  const AddCommentForumTopic = (forumTopicId: string) => {
    if (!content) return;
    let parentId;
    if (content) {
      const data = {
        forumTopicId,
        content,
        parentId: replyId,
      };
      socket.emit("newCommentForum", data);
      setContent("");
      setReplyId(null);
    }
  };

  console.log("new comments", comments);

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
                          {groupedTopics[week].map((topic) => {
                            const isFormExpanded = expandedForms.has(topic.id);
                            const isQuiz = topic.type === "quiz";
                            const questionnaire = isQuiz
                              ? topic.questionnaires?.[0]
                              : null;
                            const selectedIndex = selectedAnswers[topic.id];
                            const correctIndex = questionnaire
                              ? questionnaire.options.findIndex(
                                  (opt) => opt === questionnaire.answer
                                )
                              : -1;
                            const isCorrect =
                              selectedIndex !== undefined &&
                              selectedIndex === correctIndex;
                            const hasFeedback =
                              selectedIndex !== undefined &&
                              questionnaire &&
                              correctIndex !== -1;

                            return (
                              <div key={topic.id} className="col-12">
                                <article className="card h-100 shadow-sm border-0 overflow-hidden position-relative cursor-pointer group">
                                  <div className="card-body p-4">
                                    <div className="mb-3">
                                      <span className="badge bg-primary-subtle text-primary px-3 py-2">
                                        {isQuiz ? "Câu Hỏi Quiz" : "Thảo Luận"}
                                      </span>
                                    </div>

                                    <h2 className="card-title fw-bold mb-3 fs-4 text-dark">
                                      {topic.title}
                                    </h2>

                                    {/* Hiển thị Quiz */}
                                    {isQuiz &&
                                    questionnaire &&
                                    questionnaire.options &&
                                    questionnaire.options.length > 0 ? (
                                      <div className="card-text text-secondary mb-4 lh-lg">
                                        {topic.description && (
                                          <p
                                            style={{
                                              overflow: "hidden",
                                              display: "-webkit-box",
                                              WebkitLineClamp: "3",
                                              WebkitBoxOrient: "vertical",
                                            }}
                                          >
                                            {topic.description}
                                          </p>
                                        )}
                                        <div className="mt-3 p-3 bg-white rounded border">
                                          <h6 className="fw-bold text-primary mb-2">
                                            Các lựa chọn:
                                          </h6>
                                          <ul className="list-unstyled mb-0">
                                            {questionnaire.options.map(
                                              (option, index) => {
                                                const label =
                                                  String.fromCharCode(
                                                    65 + index
                                                  ); // A, B, C, D
                                                const isSelected =
                                                  selectedIndex === index;
                                                const isCorrectOption =
                                                  index === correctIndex;
                                                return (
                                                  <li
                                                    key={index}
                                                    className={`mb-2 p-2 border rounded cursor-pointer transition-colors ${
                                                      isSelected
                                                        ? isCorrect
                                                          ? "bg-success bg-opacity-10 border-success"
                                                          : "bg-danger bg-opacity-10 border-danger"
                                                        : hasFeedback &&
                                                          isCorrectOption
                                                        ? "bg-success bg-opacity-10 border-success"
                                                        : "hover:bg-light"
                                                    }`}
                                                    onClick={() =>
                                                      handleOptionSelect(
                                                        topic.id,
                                                        index
                                                      )
                                                    }
                                                  >
                                                    <strong
                                                      className={`text-dark ${
                                                        isSelected
                                                          ? isCorrect
                                                            ? "text-success"
                                                            : "text-danger"
                                                          : ""
                                                      }`}
                                                    >
                                                      {label}.
                                                    </strong>{" "}
                                                    {option}
                                                    {hasFeedback &&
                                                      isCorrectOption &&
                                                      !isSelected && (
                                                        <small className="text-success ms-2">
                                                          (Đáp án đúng)
                                                        </small>
                                                      )}
                                                  </li>
                                                );
                                              }
                                            )}
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
                                                {isCorrect
                                                  ? "🎉 Đúng!"
                                                  : "❌ Sai!"}{" "}
                                              </strong>
                                              {isCorrect
                                                ? "Tuyệt vời!"
                                                : `Đáp án đúng là: ${String.fromCharCode(
                                                    65 + correctIndex
                                                  )}. ${questionnaire.answer}`}
                                            </div>
                                          )}
                                          <small className="text-muted mt-2 d-block">
                                            Chọn đáp án và thảo luận bên dưới
                                            nhé!
                                          </small>
                                        </div>
                                      </div>
                                    ) : (
                                      <p
                                        className="card-text text-secondary mb-4 lh-lg"
                                        style={{
                                          overflow: "hidden",
                                          display: "-webkit-box",
                                          WebkitLineClamp: "3",
                                          WebkitBoxOrient: "vertical",
                                        }}
                                      >
                                        {topic.description || "Không có mô tả."}
                                      </p>
                                    )}

                                    <div className="d-flex justify-content-between align-items-center pt-3 border-top border-light">
                                      <div className="d-flex align-items-center text-muted small">
                                        <button
                                          className="btn btn-link p-0 text-muted hover-primary transition-colors"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleForm(topic.id);
                                            JoinRoom(topic.id);
                                          }}
                                        >
                                          <i className="bi bi-chat-square-text me-1"></i>
                                          {isFormExpanded
                                            ? "Ẩn form"
                                            : "Bình luận"}
                                        </button>
                                      </div>
                                      <button className="btn btn-primary px-4 py-2 fw-semibold rounded-pill shadow-sm">
                                        Đọc thêm
                                      </button>
                                    </div>
                                  </div>

                                  {isFormExpanded && (
                                    <div className="card-footer bg-light border-0 p-0">
                                      {/* Form nhập bình luận */}
                                      <div className="p-4 border-top border-light">
                                        <div className="row g-3 align-items-end">
                                          <div className="col-12">
                                            <div className="input-group input-group-lg">
                                              <span className="input-group-text bg-white border-end-0 rounded-start-pill shadow-sm">
                                                <i className="bi bi-person-circle text-primary"></i>
                                              </span>
                                              <textarea
                                                value={content}
                                                onChange={(e) =>
                                                  setContent(e.target.value)
                                                }
                                                className="form-control border-start-0 rounded-end-pill shadow-sm focus-ring focus-ring-primary"
                                                rows={3}
                                                placeholder="Viết bình luận của bạn... Chia sẻ suy nghĩ nhé!"
                                                style={{ resize: "none" }}
                                              ></textarea>
                                            </div>
                                          </div>
                                          <div className="col-12">
                                            <div className="d-flex justify-content-end">
                                              <button className="btn btn-outline-secondary btn-sm me-2 rounded-pill px-4">
                                                Hủy
                                              </button>
                                              <button
                                                onClick={() =>
                                                  AddCommentForumTopic(topic.id)
                                                }
                                                className="btn btn-primary fw-semibold rounded-pill px-4 shadow-sm"
                                              >
                                                <i className="bi bi-send me-1"></i>
                                                Gửi bình luận
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <CommentForum commentsInit={comments} forumTopicId={topic.id}/>
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
