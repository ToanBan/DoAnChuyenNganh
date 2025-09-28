"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import io from "socket.io-client";
import axios from "axios";
import AlertSuccess from "@/app/components/share/alert_success";
import { useCart } from "@/app/context/CartContext";
const socket = io("http://localhost:5000", { transports: ["websocket"] });

interface Topic {
  id: string;
  topic_name: string;
  videos: Video[];
  lectures: Lecture[];
}
interface Video {
  id: string;
  video_title: string;
}
interface Lecture {
  id: string;
  name: string;
}
interface Course {
  id: string;
  course_name: string;
  course_description: string;
  course_image: string;
  price: string;
  teacher: {
    name: string;
    email: string;
    phone: string;
    avatar: string;
    experience_teacher: string;
    major: string;
  };
  topics: Topic[];
  what_you_will_learn: string;
}

interface Comment {
  id: number;
  courseId: string;
  userId: string;
  user: string | { username: string };
  content: string;
  parent_id?: number | null;
  createdAt: string;
}

const CourseDetail = ({ params }: { params: Promise<{ slug: string }> }) => {
  const [user, setUser] = useState<{ username: string; id: string } | null>(
    null
  );
  const { slug } = React.use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const imageUrl = "http://localhost:5000/uploads/";
  const [imgSrc, setImgSrc] = useState<string>("");
  const [content, setContent] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const { refreshCartCount } = useCart();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/user", {
          withCredentials: true,
        });
        if (res.status === 200) {
          setUser(res.data.message);
        }
      } catch (e) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const GetCourseById = async () => {
    const res = await fetch(`http://localhost:5000/api/courses/${slug}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setCourse(data.message);
    setImgSrc(`http://localhost:5000/uploads/${data.message.teacher.avatar}`);
  };
  useEffect(() => {
    GetCourseById();
  }, []);

  useEffect(() => {
    socket.on("receive_comment", (data) => {
      setComments((prev) => [...prev, data]);
    });
    return () => {
      void socket.off("receive_comment");
    };
  }, []);

  const sendComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim()) return;
    socket.emit("new_comment", {
      courseId: slug,
      userId: user?.id,
      content,
    });
    setContent("");
  };

  const sendReply = (e: React.FormEvent<HTMLFormElement>, parentId: number) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    socket.emit("new_comment", {
      courseId: slug,
      userId: user?.id,
      content: replyContent,
      parentId,
    });
    setReplyContent("");
    setReplyingTo(null);
  };

  const GetComment = async () => {
    const res = await fetch(`http://localhost:5000/api/comments/${slug}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    setComments(data.message);
  };

  useEffect(() => {
    GetComment();
  }, []);

  const CommentItem = ({
    comment,
    comments,
    replyingTo,
    setReplyingTo,
    replyContent,
    setReplyContent,
    sendReply,
  }: {
    comment: Comment;
    comments: Comment[];
    replyingTo: number | null;
    setReplyingTo: (id: number | null) => void;
    replyContent: string;
    setReplyContent: (v: string) => void;
    sendReply: (e: React.FormEvent<HTMLFormElement>, parentId: number) => void;
  }) => {
    const replies = comments.filter((c) => c.parent_id === comment.id);
    const inputRef = useRef<HTMLInputElement>(null); // Tạo ref cho ô input
    useEffect(() => {
      if (replyingTo === comment.id && inputRef.current) {
        inputRef.current.focus();
      }
    }, [replyingTo, comment.id]);

    return (
      <div
        style={{
          marginLeft: comment.parent_id ? 24 : 0,
          marginBottom: 12,
          borderBottom: comment.parent_id ? undefined : "1px solid #eee",
        }}
      >
        <strong>
          {typeof comment.user === "string"
            ? comment.user
            : comment.user.username}
          :
        </strong>
        {comment.content}
        <div style={{ fontSize: 12, color: "#aaa" }}>
          {comment.createdAt
            ? new Date(comment.createdAt).toLocaleString()
            : ""}
        </div>
        <button
          onClick={() => setReplyingTo(comment.id)}
          className="btn btn-sm btn-link text-info p-0"
        >
          Phản hồi
        </button>
        {replyingTo === comment.id && (
          <form onSubmit={(e) => sendReply(e, comment.id)} className="mt-2">
            <input
              ref={inputRef}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="form-control mb-2"
              placeholder="Nhập phản hồi..."
              required
            />
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-info text-white">Gửi</button>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent("");
                }}
              >
                Hủy
              </button>
            </div>
          </form>
        )}
        <div className="ms-4 mt-2">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              comments={comments}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              sendReply={sendReply}
            />
          ))}
        </div>
      </div>
    );
  };

  const handleAddToCart = async (courseId: number) => {
    const res = await fetch("http://localhost:5000/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ courseId, quantity: 1 }),
      credentials: "include",
    });

    const data = await res.json();
    if (res.ok) {
      setSuccess(true);
      refreshCartCount();
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } else {
      alert(data.message || "Có lỗi xảy ra!");
    }
  };
  return (
    <>
      <div className="container-custom py-4">
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="bg-white rounded-4 shadow-lg p-4 p-md-5 mb-4">
              <h2 className="fs-2 fw-bolder text-primary mb-4">
                Giới thiệu về khóa học
              </h2>
              <p className="text-secondary lh-base fs-5 mb-3">
                {course?.course_description}
              </p>
              <h3 className="fs-3 fw-bold text-info mb-3">
                Bạn sẽ học được gì:
              </h3>
              <p>{course?.what_you_will_learn}</p>
            </div>

            <div className="bg-white rounded-4 shadow-lg p-4 p-md-5 mb-4">
              <h2 className="fs-2 fw-bolder text-primary mb-4">
                Thông tin Giảng viên
              </h2>
              <div className="d-flex flex-column align-items-center text-center">
                <Image
                  style={{
                    width: "140px",
                    height: "140px",
                    objectFit: "cover",
                  }}
                  className="img-fluid rounded-circle mb-4 border border-3 border-info shadow-sm"
                  src={
                    imgSrc ||
                    "https://www.lewesac.co.uk/wp-content/uploads/2017/12/default-avatar.jpg"
                  }
                  width={200}
                  height={200}
                  alt={course?.teacher.name || "Teacher Avatar"}
                  onError={() =>
                    setImgSrc(
                      "https://www.lewesac.co.uk/wp-content/uploads/2017/12/default-avatar.jpg"
                    )
                  }
                />
                <h3 className="fs-3 fw-bold text-dark mb-2">
                  {course?.teacher.name}
                </h3>
                <p className="text-info fs-5 mb-3 fw-semibold">
                  {course?.teacher.major}
                </p>
                <p className="text-secondary lh-base fs-5 mb-4">
                  {course?.teacher.experience_teacher}
                </p>
                <div className="d-flex gap-4">
                  <a href="#" className="text-muted hover-blue transition-300">
                    <i className="fab fa-linkedin fa-2x"></i>
                  </a>
                  <a href="#" className="text-muted hover-dark transition-300">
                    <i className="fab fa-github fa-2x"></i>
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-4 shadow-lg p-4 p-md-5 mb-4">
              <h2 className="fs-2 fw-bolder text-primary mb-4">
                Nội dung khóa học
              </h2>
              {course?.topics.map((topic) => (
                <details className="mb-3" key={topic.id}>
                  <summary>
                    {topic.topic_name}
                    <i className="fas fa-chevron-down ms-2"></i>
                  </summary>
                  <div className="p-3 bg-light rounded-bottom border border-top-0 border-light">
                    {topic.videos.length > 0 && (
                      <>
                        <h6 className="text-primary">Videos</h6>
                        {topic.videos.map((video, index) => (
                          <div
                            className="lesson-item d-flex align-items-center mb-2"
                            key={video.id}
                          >
                            <i className="fas fa-video text-danger me-2"></i>
                            <span>
                              Video {index + 1}. {video.video_title}
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                    {/* Lectures */}
                    {topic.lectures.length > 0 && (
                      <>
                        <h6 className="text-success mt-3">Lectures</h6>
                        {topic.lectures.map((lecture, index) => (
                          <div
                            className="lesson-item d-flex align-items-center mb-2"
                            key={lecture.id}
                          >
                            <i className="fas fa-file-alt text-success me-2"></i>
                            <span>
                              Tài liệu {index + 1}. {lecture.name}
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </details>
              ))}
            </div>

            <div className="bg-white rounded-4 shadow-lg p-4 p-md-5 mb-4">
              <h2 className="fs-3 fw-bold text-primary mb-3">Bình luận</h2>
              <form
                onSubmit={sendComment}
                className="row g-2 align-items-center mb-3"
              >
                <div className="col-md-7 mb-2 mb-md-0">
                  <input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Nhập bình luận realtime..."
                    className="form-control"
                    required
                  />
                </div>
                <div className="col-md-2">
                  <button
                    type="submit"
                    className="btn btn-info text-white w-100 fw-bold"
                  >
                    Gửi
                  </button>
                </div>
              </form>
              <hr />
              <div style={{ maxHeight: 300, overflowY: "auto" }}>
                {comments
                  .filter((c) => !c.parent_id) // comment gốc
                  .map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      comments={comments}
                      replyingTo={replyingTo}
                      setReplyingTo={setReplyingTo}
                      replyContent={replyContent}
                      setReplyContent={setReplyContent}
                      sendReply={sendReply}
                    />
                  ))}
              </div>
            </div>
          </div>

          <div className="col-lg-4 mt-4 mt-lg-0">
            <div className="sticky-sidebar bg-white rounded-4 shadow-lg p-4 p-md-5">
              <Image
                className="img-fluid rounded-3 mb-4"
                alt={`${course?.course_name}`}
                src={`${imageUrl}${course?.course_image}`}
                width={250}
                height={250}
              />
              <div className="fs-1 fw-bolder text-success mb-4">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(Number(course?.price))}
              </div>
              <button onClick={()=>handleAddToCart(Number(course?.id))} className="btn button-primary-custom w-100 text-white fw-bold py-3 px-4 rounded-3 shadow-sm mb-3">
                <i className="fas fa-shopping-cart me-2"></i> Thêm vào giỏ hàng
              </button>
              <button className="btn button-secondary-custom w-100 text-white fw-bold py-3 px-4 rounded-3 shadow-sm mb-4">
                <i className="fas fa-credit-card me-2"></i> Mua ngay
              </button>
              <h3 className="fs-4 fw-bold text-primary mb-3">
                Khóa học này bao gồm:
              </h3>
              <ul className="list-unstyled text-secondary space-y-2">
                <li>
                  <i className="fas fa-play-circle text-info me-2"></i> 15 giờ
                  video theo yêu cầu
                </li>
                <li>
                  <i className="fas fa-file-alt text-info me-2"></i> 20 bài viết
                </li>
                <li>
                  <i className="fas fa-download text-info me-2"></i> 10 tài
                  nguyên có thể tải xuống
                </li>
                <li>
                  <i className="fas fa-infinity text-info me-2"></i> Truy cập
                  trọn đời
                </li>
                <li>
                  <i className="fas fa-mobile-alt text-info me-2"></i> Truy cập
                  trên thiết bị di động và TV
                </li>
                <li>
                  <i className="fas fa-certificate text-info me-2"></i> Chứng
                  chỉ hoàn thành
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {success && <AlertSuccess message="Thêm Giỏ Hàng Thành Công"/>}
    </>
  );
};

export default CourseDetail;
