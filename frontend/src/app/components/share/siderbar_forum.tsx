"use client";
import React, { useState } from "react";
import { FileText, LogOut, Settings, Home } from "lucide-react";
import Link from "next/link";
import AlertSuccess from "./alert_success";
import AlertError from "./alert_error";
const SidebarForum = ({
 
  forumId,
}: {
  
  forumId: string;
}) => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false)
  const QuitForum = async(e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/forum/${forumId}`, {
        method:"DELETE", 
        credentials:"include"
      })

      if(res.ok){
        setSuccess(true);
        setTimeout(()=>{
          setSuccess(false)
        }, 3000)
        window.location.href = "/"
      }else{
        setError(true);
        setTimeout(()=>{
          setError(false)
        })
      }
    } catch (error) {
      console.error(error);
      return;
    }
  }

  return (
    <>
      <aside className="col-lg-3 d-none d-lg-block">
        <div
          className="card shadow-lg border-0 h-100 sticky-top"
          style={{ top: "1rem", borderRadius: "1rem", overflow: "hidden" }}
        >
          <div className="card-header bg-gradient text-white border-0 p-4 position-relative overflow-hidden">
            <div
              className="position-absolute top-0 start-0 w-100 h-100 opacity-10"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            ></div>
            <div className="position-relative">
              <div className="d-flex align-items-center mb-3">
                <div>
                  
                  <small className="opacity-75">Diễn đàn học tập</small>
                </div>
              </div>
              <h5 className="mb-0 fw-bold d-flex align-items-center">
                <Settings size={18} className="me-2" />
                Quản Lý Nhóm
              </h5>
            </div>
          </div>

          {/* Body với items đẹp */}
          <div className="card-body p-0">
            <ul className="list-group list-group-flush">
              <li className="list-group-item px-4 py-4 border-0 d-flex align-items-center sidebar-item">
                <Link
                  className="nav-link text-decoration-none d-flex align-items-center w-100 p-2 rounded-3 transition-all"
                  style={{ transition: "all 0.3s ease" }}
                  href={`/forum/${forumId}`}
                >
                  <Home className="me-3 text-primary" size={20} />
                  <div className="flex-grow-1">
                    <span className="fw-semibold text-dark d-block">
                      Trang Chủ Diễn Đàn
                    </span>
                    <small className="text-muted">Home Forum</small>
                  </div>
                </Link>
              </li>

              <li className="list-group-item px-4 py-4 border-0 d-flex align-items-center sidebar-item">
                <Link
                  className="nav-link text-decoration-none d-flex align-items-center w-100 p-2 rounded-3 transition-all"
                  style={{ transition: "all 0.3s ease" }}
                  href={`${forumId}/posts`}
                >
                  <FileText className="me-3 text-primary" size={20} />
                  <div className="flex-grow-1">
                    <span className="fw-semibold text-dark d-block">
                      Posts User
                    </span>
                    <small className="text-muted">Xem bài viết</small>
                  </div>
                </Link>
              </li>

              <li className="list-group-item px-4 py-4 border-0 d-flex align-items-center sidebar-item">
                <a
                  href="#"
                  className="nav-link text-decoration-none d-flex align-items-center w-100 p-2 rounded-3 transition-all"
                  style={{ transition: "all 0.3s ease" }}
                >
                  <LogOut className="me-3 text-danger" size={20} />
                  <div onClick={QuitForum} className="flex-grow-1">
                    <span className="fw-semibold text-dark d-block">
                      Rời Nhóm
                    </span>
                    <small className="text-muted">Xem bài viết</small>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <style jsx>{`
          .sidebar-item:hover .icon-wrapper {
            transform: scale(1.05);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          .sidebar-item:hover .nav-link {
            background-color: rgba(0, 123, 255, 0.05);
            transform: translateX(5px);
          }
          .bg-gradient {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
        `}</style>
      </aside>

      {success && <AlertSuccess message="Đã Rời Nhóm Thành Công, Chờ Chút Xíu"/>}
      {error && <AlertError message="Vui Lòng Thử Lại"/>}
    </>
  );
};

export default SidebarForum;
