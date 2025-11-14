"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import socket from "@/lib/socket";

interface Comment {
  id: number;
  postId: number;
  userId: number;
  user?: { username: string; avatar?: string };
  content: string;
  parentId?: number | null;
  forumTopicId: string;
  createdAt?: string;
  children?: Comment[]; // Optional, vì ta sẽ build động
}

const CommentForum = ({
  forumTopicId,
  commentsInit,
}: {
  forumTopicId: string;
  commentsInit: Comment[];
}) => {
  const [comments, setComments] = useState<Comment[]>(commentsInit); // Giữ flat list
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState<string>("");
  const imageUrl = "http://localhost:5000/uploads/";
  const defaultAvatar =
    "https://www.lewesac.co.uk/wp-content/uploads/2017/12/default-avatar.jpg";

  const GetCommentForumTopicId = async () => {
    if (!forumTopicId) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/comment_forumtopic/${forumTopicId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Thêm nếu cần auth
        }
      );

      if (res.ok) {
        const data = await res.json();
        setComments(data.message || []); // Flat list từ API
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error(error);
      setComments([]);
    }
  };

  // Build tree từ flat list (xử lý parentId)
  const buildCommentTree = (list: Comment[]): Comment[] => {
    const map: Record<number, Comment> = {};
    const roots: Comment[] = [];

    // Tạo map và init children []
    list.forEach((c) => {
      map[c.id] = { ...c, children: [] };
    });

    // Attach children dựa trên parentId
    list.forEach((c) => {
      const comment = map[c.id];
      if (c.parentId) {
        const parent = map[c.parentId];
        if (parent) {
          parent.children!.push(comment);
        }
      } else {
        roots.push(comment);
      }
    });

    // Sort roots theo createdAt hoặc id nếu cần
    roots.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());

    return roots;
  };

  const commentTree = buildCommentTree(comments); // Compute tree mỗi render

  const toggleReply = (commentId: number) => {
    if (replyingTo === commentId) {
      setReplyingTo(null);
      setReplyContent("");
    } else {
      setReplyingTo(commentId);
      setReplyContent("");
    }
  };

  useEffect(() => {
    GetCommentForumTopicId();
  }, [forumTopicId]); // Depend forumTopicId để re-fetch nếu thay đổi

  useEffect(() => {
    if (!socket || !forumTopicId) return;

    // Join room nếu backend hỗ trợ
    socket.emit("joinForumRoom", `forumTopic-${forumTopicId}`);

    const handleReceiveComment = (data: Comment) => {
      console.log("Nhận bình luận mới:", data);
      if (data.forumTopicId === forumTopicId) { // Match forumTopicId
        setComments((prev) => [...prev, data]); // Append vào flat list, tree sẽ rebuild tự động
      }
    };

    socket.on("receiveCommentForum", handleReceiveComment);

    return () => {
      socket.off("receiveCommentForum", handleReceiveComment);
      socket.emit("leaveForumRoom", `forumTopic-${forumTopicId}`); // Cleanup
    };
  }, [socket, forumTopicId]);

  const ReplyCommentForumTopic = (parentId: number) => {
    if (!replyContent.trim()) return;

    const data = {
      forumTopicId, // Dùng prop forumTopicId
      content: replyContent,
      parentId,
    };
    socket.emit("newCommentForum", data);
    setReplyContent("");
    setReplyingTo(null); // Đóng form sau gửi
  };

  const renderComment = (comment: Comment, level: number = 0) => (
    <div
      key={comment.id}
      className={`mb-3 ${level > 0 ? `ms-${level * 2}` : ""}`}
    >
      <div className="d-flex align-items-start">
        <Image
          src={
            comment.user?.avatar
              ? `${imageUrl}${comment.user.avatar}`
              : defaultAvatar
          }
          alt={`${comment.user?.username || "Anonymous"}'s avatar`}
          className="rounded-circle me-2 border border-1 border-light shadow-sm"
          width={40}
          height={40}
          style={{ objectFit: "cover" }}
        />
        <div className="flex-grow-1">
          <h6 className="mb-1 fw-semibold small">
            {comment.user?.username || "Anonymous"}
          </h6>
          <p className="mb-1 small">{comment.content}</p>
          <small className="text-muted small">
            {new Date(comment.createdAt || "").toLocaleString("vi-VN")}
          </small>
          <div className="mt-1">
            <button
              className="btn btn-link p-0 text-decoration-none text-muted small"
              onClick={() => toggleReply(comment.id)}
            >
              {replyingTo === comment.id ? "Hủy" : "Phản hồi"}
            </button>
          </div>

          {replyingTo === comment.id && (
            <div className="mt-2 p-2 border rounded bg-light">
              <textarea
                className="form-control mb-2"
                rows={3}
                placeholder="Viết phản hồi của bạn..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => ReplyCommentForumTopic(comment.id)} // Chỉ cần parentId
                >
                  Gửi
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => toggleReply(comment.id)}
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Render children (replies) */}
      {comment.children && comment.children.length > 0 && (
        <div
          className={`ms-4 mt-2 border-start ps-3 ${
            level > 0 ? "border-info" : ""
          }`}
        >
          {comment.children.map((child) => renderComment(child, level + 1))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="p-4 border-top border-light">
        {commentTree.length > 0 ? (
          commentTree.map((comment) => renderComment(comment))
        ) : (
          <p className="text-muted fst-italic">Chưa có bình luận nào.</p>
        )}
      </div>
    </>
  );
};

export default CommentForum;