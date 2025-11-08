import React, { useState } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import ReactionPost from "./ReactionPost";
import socket from "@/lib/socket";
import CommentPost from "./CommentPost";
interface PostProps {
  id: string;
  post_url: string | null;
  post_caption: string;
  posts_like: string;
  type: string;
  user: {
    avatar: string;
    username: string;
  };
  updatedAt: string;
  reactions: {
    reactionType: string;
  }[];
  reactionCount: number;
}

const PostCard = ({ posts }: { posts: PostProps[] }) => {
  const imageUrl = "http://localhost:5000/uploads/";
  const [commentPostId, setCommentPostId] = useState<string | null>(null);

  const toggleComments = (postId: string) => {
    setCommentPostId((prev) => (prev === postId ? null : postId));
  };

  const JoinRoom = (postId: string) => {
    socket.emit("joinPostRoom", `post-${postId}`);
  };

  return (
    <>
      {Array.isArray(posts) &&
        posts.map((post) => (
          <div className="post-card mt-2" key={post.id}>
            <div className="d-flex align-items-center justify-content-between post-header">
              <div className="d-flex align-items-center">
                <Image
                  className="rounded-circle me-3 user-avatar"
                  alt="avatar"
                  width={50}
                  height={50}
                  src={
                    post.user?.avatar
                      ? `${imageUrl}${post.user.avatar}`
                      : "https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png"
                  }
                />

                <div>
                  <h5 className="username">{post.user.username}</h5>
                  <small className="post-time">
                    {dayjs(post.updatedAt).format("DD/MM/YYYY HH:mm")}
                  </small>
                </div>
              </div>
            </div>

            <div className="post-media-content">
              {post.type === "image" && post.post_url && (
                <Image
                  className="img-fluid post-media"
                  alt="image_post"
                  width={600}
                  height={400}
                  src={imageUrl + post.post_url}
                />
              )}

              {post.type === "video" && post.post_url && (
                <video
                  className="img-fluid post-media"
                  controls
                  width={600}
                  height={400}
                >
                  <source src={imageUrl + post.post_url} type="video/mp4" />
                  Trình duyệt của bạn không hỗ trợ thẻ video.
                </video>
              )}
            </div>

            <div className="post-caption">
              <p className="caption-text">
                <span className="caption-username">{post.user.username}</span>{" "}
                {post.post_caption}
              </p>
            </div>

            <div className="post-footer">
              <div className="d-flex justify-content-around align-items-center border-top pt-3 interaction-buttons">
                <ReactionPost
                  postId={post.id}
                  typeReaction={post.reactions[0]?.reactionType}
                  reactionCount={post.reactionCount}
                />

                <button
                  className="btn btn-light btn-sm"
                  onClick={() => {
                    toggleComments(post.id);
                    JoinRoom(post.id);
                  }}
                >
                  <i className="bi bi-chat-dots me-1"></i> Bình luận
                </button>

                <button className="btn btn-light btn-sm">
                  <i className="bi bi-share me-1"></i> Chia sẻ
                </button>
              </div>

              {commentPostId === post.id && <CommentPost postId={post.id} />}
            </div>
          </div>
        ))}
    </>
  );
};

export default PostCard;
