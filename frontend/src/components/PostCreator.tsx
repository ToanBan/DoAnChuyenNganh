"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Video, Image as ImageIcon, Smile, X } from "lucide-react";
import AlertSuccess from "@/app/components/share/alert_success";
import AlertError from "@/app/components/share/alert_error";

interface PostCreatorProps {
  forumId?: string;
  onPostAdded?: () => Promise<void>;
}

const PostCreator = ({ forumId, onPostAdded }: PostCreatorProps) => {
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const AddPost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (forumId) {
      formData.append("forumId", forumId);
    }
    try {
      const res = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (res.ok) {
        setSuccess(true);
        setShowModal(false);
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
        setTimeout(async () => {
          if (onPostAdded) {
            try {
              await onPostAdded();
              console.log("Refresh done after delay!");
            } catch (err) {
              console.error("Delayed refresh failed:", err);
            }
          }
        }, 3000); 
      } else {
        setError(true);
        setTimeout(() => {
          setError(false);
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      return;
    }
  };

  return (
    <>
      <div className="post-card p-3 w-100">
        <div className="d-flex align-items-center mb-3">
          <Image
            src="https://icons.iconarchive.com/icons/papirus-team/papirus-status/512/avatar-default-icon.png"
            alt="user-avatar"
            width={50}
            height={50}
            className="rounded-circle me-3"
          />
          <input
            type="text"
            className="form-control rounded-pill"
            placeholder="What's on your mind?"
            style={{
              backgroundColor: "#f0f2f5",
              border: "none",
              padding: "12px 20px",
              cursor: "pointer",
            }}
            readOnly
            onClick={() => setShowModal(true)}
          />
        </div>
        <hr />
        <div className="d-flex justify-content-around">
          <button className="btn btn-light d-flex align-items-center gap-2">
            <Video size={20} className="text-danger" /> Live Video
          </button>
          <button className="btn btn-light d-flex align-items-center gap-2">
            <ImageIcon size={20} className="text-success" /> Photo/Video
          </button>
          <button className="btn btn-light d-flex align-items-center gap-2">
            <Smile size={20} className="text-warning" /> Feeling/Activity
          </button>
        </div>
      </div>

      {showModal && (
        <div
          className="modal fade show d-block custom-backdrop"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered custom-modal">
            <div className="modal-content rounded-4">
              <div className="modal-header d-flex justify-content-between">
                <h5 className="modal-title fw-bold">Create Post</h5>
                <button
                  className="btn btn-light rounded-circle"
                  onClick={() => setShowModal(false)}
                >
                  <X />
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={AddPost}>
                  <textarea
                    className="form-control mb-3"
                    rows={3}
                    placeholder="What's on your mind?"
                    name="post_title"
                  />
                  <input
                    type="file"
                    className="form-control"
                    name="file_path"
                  />

                  <div className="d-flex justify-content-end mt-3 gap-3">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Post
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {success && <AlertSuccess message="Thêm Bài Viết Thành Công" />}
      {error && <AlertError message="Thêm Bài Viết Thất Bại" />}

      <style jsx>{`
        .custom-backdrop {
          animation: fadeIn 0.3s ease;
        }
        .custom-modal {
          animation: zoomIn 0.3s ease;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes zoomIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default PostCreator;
