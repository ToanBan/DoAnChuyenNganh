"use client";
import React, { useEffect, useState } from "react";
import { Heart, Laugh, ThumbsUp, Angry, Frown, Zap } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";


const ReactionPost = ({
  postId,
  typeReaction,
  reactionCount,
}: {
  postId: string;
  typeReaction: string;
  reactionCount: number;
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [changeReaction, setChangeReaction] = useState(typeReaction);
  const [reaction_count, setReaction_count] = useState(reactionCount);
  const reactions = [
    { icon: <ThumbsUp size={28} className="text-primary" />, label: "like" },
    { icon: <Heart size={28} className="text-danger" />, label: "love" },
    { icon: <Laugh size={28} className="text-warning" />, label: "haha" },
    { icon: <Zap size={28} className="text-purple" />, label: "wow" },
    { icon: <Frown size={28} className="text-info" />, label: "sad" },
    { icon: <Angry size={28} className="text-red" />, label: "angry" },
  ];




  const HandleToggleReaction = async (valueReaction: string) => {
    try {
      const res = await fetch("http://localhost:5000/api/post/reaction", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ valueReaction, postId }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setReaction_count(data.countReactions);
      setChangeReaction(data.reactionType ?? null);
    } catch (error) {
      console.error(error);
      return;
    }
  };

  const activeReaction = reactions.find((r) => r.label === changeReaction);

  

  return (
    <>
      <style jsx global>{`
        .reaction-post-container .reaction-btn {
          border-radius: 50px;
          border: 1px solid #dee2e6;
          transition: all 0.2s ease-in-out;
          color: #495057;
          background-color: #f8f9fa;
        }

        .reaction-post-container .reaction-btn:hover {
          background-color: #e9ecef;
        }

        .reaction-post-container .reaction-popup {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) scale(0.9);
          margin-bottom: 0.75rem;
          display: flex;
          gap: 0.75rem;
          padding: 0.5rem 1rem;
          background-color: rgba(255, 255, 255, 0.95);
          border-radius: 50px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid #e9ecef;
          z-index: 20;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        }

        .reaction-post-container .reaction-popup.show {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) scale(1);
        }

        .reaction-post-container .reaction-popup button {
          transition: all 0.2s ease-in-out;
          position: relative;
        }

        .reaction-post-container .reaction-popup button:hover {
          transform: scale(1.25) translateY(-5px);
        }

        .reaction-post-container .reaction-popup .tooltip-text {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 0.5rem;
          background-color: rgba(33, 37, 41, 0.85);
          color: #fff;
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s ease;
        }

        .reaction-post-container .reaction-popup button:hover .tooltip-text {
          opacity: 1;
          visibility: visible;a
        }

        /* Tùy chỉnh màu Lucide Icons để tương thích với Bootstrap */
        .text-purple {
          color: #6f42c1;
        }
        .text-red {
          color: #dc3545;
        }
      `}</style>

      <div
        className="reaction-post-container position-relative d-inline-block"
        onMouseEnter={() => setShowReactions(true)}
        onMouseLeave={() => setShowReactions(false)}
      >
        <button
          onClick={() => HandleToggleReaction(changeReaction || "like")}
          className="reaction-btn btn btn-light d-flex align-items-center gap-2 px-3 py-2"
        >
          {/* Nếu có reaction thì hiện icon + tên reaction, còn không thì hiện Like mặc định */}
          {activeReaction ? activeReaction.icon : <ThumbsUp size={18} />}
          <span>{reaction_count}</span>
          <span className="fw-medium">
            {activeReaction ? activeReaction.label : "Like"}
          </span>
        </button>

        <div className={`reaction-popup ${showReactions ? "show" : ""}`}>
          {reactions.map((reaction, idx) => (
            <button
              onClick={() => HandleToggleReaction(reaction.label)}
              key={idx}
              className="btn btn-link p-0 border-0 bg-transparent text-decoration-none"
              title={reaction.label}
            >
              {reaction.icon}
              <span className="tooltip-text">{reaction.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default ReactionPost;
