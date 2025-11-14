import { useEffect, useState } from "react";
import socket from "../lib/socket";

interface Comment {
  id: number;
  postId: number;
  userId: number;
  user?: { username: string; avatar?: string };
  content: string;
  parentId?: number | null;
  createdAt?: string;
  children?: Comment[];
}

const CommentPost = ({ postId }: { postId: string }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  console.log("Post ID in CommentPost:", postId);

  const sendComment = async () => {
    if (newComment.trim() === "") return;
    const commentData = {
      postId: Number(postId),
      text: newComment,
    };
    socket.emit("newComment", commentData);
    setNewComment("");
  };


  const sendReply = async (parentId: number) => {
    if (replyContent.trim() === "") return;
    const replyData = {
      postId: Number(postId),
      text: replyContent,
      parentId,
    };
    socket.emit("newComment", replyData);
    setReplyContent("");
    setReplyingTo(null);
  };

  useEffect(() => {
    const handler = (data: Comment) => {
      if (data.postId === Number(postId)) {
        setComments((prev) => [...prev, data]);
      }
    };

    socket.on("receiveComment", handler);
    return () => {
      socket.off("receiveComment", handler);
    };
  }, [postId]);

  const GetCommentsByPostId = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/comments/posts/${postId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      console.log(data.message);
      setComments(data.message);
    } catch (error) {
      console.error("Lỗi khi lấy bình luận:", error);
    }
  };

  useEffect(() => {
    GetCommentsByPostId();
  }, []);

  const buildCommentTree = (list: Comment[]) => {
    const map: Record<number, Comment> = {};
    const roots: Comment[] = [];

    list.forEach((c) => {
      map[c.id] = { ...c, children: [] };
    });
    list.forEach((c) => {
      if (c.parentId) {
        map[c.parentId]?.children?.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });
    return roots;
  };

  const commentTree = buildCommentTree(comments);

  const renderComments = (commentList: Comment[]) => {
    return commentList.map((cmt) => (
      <div key={cmt.id} className="mb-3">
        <div className="comment-box">
          <p className="mb-1">
            <strong>{cmt.user?.username}:</strong> {cmt.content}
          </p>

          <button
            className="reply-btn btn btn-light"
            onClick={() => setReplyingTo(replyingTo === cmt.id ? null : cmt.id)}
          >
            Trả lời
          </button>

          {replyingTo === cmt.id && (
            <div className="d-flex align-items-center mt-2">
              <input
                type="text"
                className="form-control me-2"
                placeholder="Viết phản hồi..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
              />
              <button
                className="btn btn-sm btn-primary"
                onClick={() => sendReply(cmt.id)}
              >
                Gửi
              </button>
            </div>
          )}
        </div>

        {cmt.children && cmt.children.length > 0 && (
          <div className="ms-4 mt-2 border-start ps-2">
            {renderComments(cmt.children)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="comment-section mt-3 p-2 border rounded bg-light">
      <div
        className="comments-list mb-2"
        style={{ maxHeight: "200px", overflowY: "auto" }}
      >
        {commentTree.length > 0 ? (
          renderComments(commentTree)
        ) : (
          <p>Chưa có bình luận nào.</p>
        )}
      </div>

      <div className="d-flex align-items-center">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Viết bình luận..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button onClick={sendComment} className="btn btn-primary">
          Gửi
        </button>
      </div>

      <style jsx>{`
        .comment-box {
          background: #fff;
          padding: 6px 10px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .reply-btn {
          background: none;
          border: none;
          color: #65676b;
          font-size: 14px;
          cursor: pointer;
          padding: 0;
          margin-top: 4px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          transition: color 0.2s ease-in-out, transform 0.1s;
        }

        .reply-btn:hover {
          color: #1877f2;
          text-decoration: none;
          transform: translateY(-1px);
        }

        .reply-btn::before {
          content: "💬";
          font-size: 13px;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};

export default CommentPost;
