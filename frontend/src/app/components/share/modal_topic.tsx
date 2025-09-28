"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Eye,
  PlayCircle,
  Video,
  HelpCircle,
  BookOpenCheck,
  X,
  ShoppingCart,
  ExternalLink,
} from "lucide-react";

interface Video {
  id: string;
  video_title: string;
  video_url: string;
}

interface Lecture {
  id: string;
  name_lecture: string;
}

interface Topic {
  id: string;
  topic_name: string;
  topic_description: string;
  videos: Video[];
  lectures: Lecture[];
  questions: [];
}

const ModalTopicDetail = ({ topicId, slug}: { topicId: string, slug:string}) => {
  const [topic, setTopic] = useState<Topic | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const bootstrapModal = useRef<any>(null);
 
  const fetchTopicDetail = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/topics/${topicId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setTopic(data.message);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu topic:", error);
    }
  };

  const openModal = async () => {
    await fetchTopicDetail();
    if (bootstrapModal.current) {
      bootstrapModal.current.show();
    }
  };

  useEffect(() => {
    //@ts-ignore
    import("bootstrap/dist/js/bootstrap.bundle.min.js").then((bootstrap) => {
      if (modalRef.current) {
        const Modal = bootstrap.Modal || (window as any).bootstrap?.Modal;
        if (Modal) {
          bootstrapModal.current = new Modal(modalRef.current, {
            backdrop: "static",
            keyboard: false,
          });
        }
      }
    });
  }, []);

  const handleCheckout = async () => {
    const res = await fetch(
      "http://localhost:5000/api/topic/checkout/create-session",
      {
        method: "POST",
        body:JSON.stringify({topicId, slug}),
        credentials: "include",
        headers:{
          "Content-Type":"application/json"
        }
      }
    );
    const data = await res.json();
    if(res.ok){
      window.location.href = data.url
    }else{
      alert("sai")
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="btn btn-outline-primary d-flex align-items-center gap-2"
      >
        <Eye size={18} /> Xem nhanh
      </button>

      <div
        className="modal fade"
        id="topicDetailModal"
        tabIndex={-1}
        aria-labelledby="topicDetailModalLabel"
        aria-hidden="true"
        ref={modalRef}
      >
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content border-0 rounded-4 shadow">
            <div className="modal-header bg-white border-0 px-4 pt-4">
              <div>
                <h3
                  className="modal-title fw-bold text-primary mb-1"
                  id="topicDetailModalLabel"
                >
                  {topic?.topic_name || "Đang tải..."}
                </h3>
                <p className="text-muted mb-0 fs-6">
                  {topic?.topic_description}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-light rounded-circle position-absolute"
                style={{ top: "1rem", right: "1rem" }}
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body px-4">
              {topic ? (
                <div className="row">
                  {/* Info Box */}
                  <div className="col-md-4 mb-4">
                    <div className="border rounded-4 p-4 h-100 bg-light shadow-sm">
                      <h6 className="text-secondary d-flex align-items-center gap-2 mb-3">
                        <HelpCircle size={20} />
                        Thông tin chung
                      </h6>
                      <p className="mb-3 d-flex justify-content-between fs-6">
                        <span>Câu hỏi:</span>
                        <span className="badge bg-primary rounded-pill">
                          {topic.questions.length}
                        </span>
                      </p>
                      <p className="mb-3 d-flex justify-content-between fs-6">
                        <span>Bài giảng:</span>
                        <span className="badge bg-info text-dark rounded-pill">
                          {topic.lectures.length}
                        </span>
                      </p>
                      <p className="mb-0 d-flex justify-content-between fs-6">
                        <span>Video:</span>
                        <span className="badge bg-warning text-dark rounded-pill">
                          {topic.videos.length}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Bài giảng */}
                  <div className="col-md-8 mb-4">
                    <div className="border rounded-4 p-4 bg-white h-100 shadow-sm">
                      <h6 className="text-secondary d-flex align-items-center gap-2 mb-3">
                        <BookOpenCheck size={20} /> Danh sách bài giảng
                      </h6>
                      <ul className="list-group list-group-flush">
                        {topic.lectures.map((lecture) => (
                          <li
                            key={lecture.id}
                            className="list-group-item d-flex align-items-center gap-2 ps-0 border-0"
                          >
                            <PlayCircle size={18} className="text-success" />
                            <span className="fw-medium">
                              {lecture.name_lecture}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Videos */}
                  <div className="col-12 mb-2">
                    <div className="border rounded-4 p-4 bg-white shadow-sm">
                      <h6 className="text-secondary d-flex align-items-center gap-2 mb-3">
                        <Video size={20} /> Danh sách video
                      </h6>
                      <div className="row">
                        {topic.videos.map((video) => (
                          <div key={video.id} className="col-md-6 mb-3">
                            <div
                              className="rounded-3 border bg-light p-3 shadow-sm d-flex justify-content-between align-items-center hover-shadow"
                              style={{
                                transition: "all 0.3s",
                                cursor: "pointer",
                              }}
                            >
                              <span className="fw-semibold text-dark">
                                {video.video_title}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p>Đang tải nội dung...</p>
              )}
            </div>

            <div className="modal-footer border-0 px-4 pb-4 d-flex justify-content-end">
              <button onClick={handleCheckout} className="btn btn-lg btn-primary d-flex align-items-center gap-2 px-4 shadow">
                <ShoppingCart size={20} />
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalTopicDetail;
