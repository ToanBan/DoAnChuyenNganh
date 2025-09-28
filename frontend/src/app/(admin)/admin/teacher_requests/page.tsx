"use client";
import React, { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Image from "next/image";
import AlertSuccess from "@/app/components/share/alert_success";

interface Teacher {
  id: string;
  name: string;
  address: string;
  phone: string;
  birthday: string;
  avatar: string;
  certification: string;
  experience_teacher: string;
  major: string;
  user_id:string;
}

const TeacherRequestPage = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [success, setSuccess] = useState(false);
  const [expandedTeacherId, setExpandedTeacherId] = useState<string | null>(
    null
  );
  const imageUrl = "http://localhost:5000/uploads/";

  const GetTeacherRequest = async () => {
    const res = await fetch("http://localhost:5000/api/teacher_requests", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    setTeachers(data.message);
  };

  useEffect(() => {
    GetTeacherRequest();
  }, []);

  const toggleDetails = (id: string): void => {
    setExpandedTeacherId(expandedTeacherId === id ? null : id);
  };

  const handleStatus = async (
    e: React.MouseEvent<HTMLButtonElement>,
    status: string,
    userId:string
  ) => {
    e.preventDefault();
    const res = await fetch(
      "http://localhost:5000/api/teacher_request_status",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, userId}),
        credentials: "include",
      }
    );
    if (res.status === 200) {
      setSuccess(true);
      GetTeacherRequest();
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }
  };

  
  return (
    <>
      <div className="content">
        <Box>
          <div className="min-vh-100 bg-gradient-to-br from-purple-50 to-indigo-100 p-lg-8 font-sans">
            <header className="text-center mb-5">
              <h1 className="display-4 fw-bold text-dark mb-2 drop-shadow-lg">
                Danh Sách Giáo Viên Đăng Ký
              </h1>
              <p className="lead text-secondary">
                Quản lý thông tin và trạng thái đăng ký của giáo viên.
              </p>
            </header>

            <div className="container-fluid bg-white rounded-4 shadow-lg overflow-hidden">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-purple-100">
                    <tr>
                      <th
                        scope="col"
                        className="px-3 py-3 text-start text-xs font-medium text-purple-700 text-uppercase"
                      >
                        Tên Giáo Viên
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-start text-xs font-medium text-purple-700 text-uppercase"
                      >
                        Điện Thoại
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-start text-xs font-medium text-purple-700 text-uppercase"
                      >
                        Hành Động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {teachers.map((teacher) => (
                      <React.Fragment key={teacher.id}>
                        <tr>
                          <td className="px-3 py-4 text-nowrap">
                            <div className="d-flex align-items-center">
                              <div className="flex-shrink-0 me-3">
                                <Image
                                  width={40}
                                  height={40}
                                  className="rounded-circle object-fit-cover"
                                  src={`${imageUrl}${teacher.avatar}`}
                                  alt="avatar"
                                ></Image>
                              </div>
                              <div>
                                <div className="text-sm font-weight-medium text-dark">
                                  {teacher.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4 text-nowrap">
                            <div className="text-sm text-dark">
                              {teacher.phone}
                            </div>
                          </td>
                          <td className="px-3 py-4 text-nowrap">
                            <button
                              onClick={(e) => handleStatus(e, "Approved", teacher.user_id)}
                              className="btn btn-success btn-sm me-2 shadow-sm animate-btn"
                            >
                              Chấp nhận
                            </button>
                            <button
                              onClick={(e) => handleStatus(e, "Rejected", teacher.user_id)}
                              className="btn btn-danger btn-sm me-2 shadow-sm animate-btn"
                            >
                              Từ chối
                            </button>
                            <button
                              onClick={() => toggleDetails(teacher.id)}
                              className="btn btn-info btn-sm shadow-sm animate-btn"
                              // Bootstrap's data attributes for collapse
                              data-bs-toggle="collapse"
                              data-bs-target={`#collapse-${teacher.id}`}
                              aria-expanded={expandedTeacherId === teacher.id}
                              aria-controls={`collapse-${teacher.id}`}
                            >
                              {expandedTeacherId === teacher.id
                                ? "Thu gọn"
                                : "Xem chi tiết"}
                            </button>
                          </td>
                        </tr>
                        {/* Collapsible row for details */}
                        <tr>
                          <td colSpan={3} className="p-0 border-0">
                            <div
                              className={`collapse ${
                                expandedTeacherId === teacher.id ? "show" : ""
                              }`}
                              id={`collapse-${teacher.id}`}
                            >
                              <div className="card card-body border-0 rounded-0 bg-light p-4">
                                <div className="row g-4 text-sm text-secondary">
                                  <div className="col-12 col-md-6">
                                    <h6 className="fw-bold mb-2 text-dark">
                                      Thông tin chi tiết:
                                    </h6>
                                    <p className="d-flex align-items-center mb-1">
                                      <i className="bi bi-geo-alt-fill me-2 text-primary"></i>{" "}
                                      {/* Bootstrap Icon for location */}
                                      <span className="fw-medium">
                                        Địa chỉ:
                                      </span>{" "}
                                      {teacher.address}
                                    </p>
                                    <p className="d-flex align-items-center mb-1">
                                      <i className="bi bi-calendar-date-fill me-2 text-primary"></i>{" "}
                                      {/* Bootstrap Icon for calendar */}
                                      <span className="fw-medium">
                                        Ngày sinh:
                                      </span>{" "}
                                      {teacher.birthday}
                                    </p>

                                    <p className="d-flex align-items-start">
                                      <i className="bi bi-briefcase-fill me-2 text-primary mt-1"></i>{" "}
                                      {/* Bootstrap Icon for briefcase */}
                                      <span className="fw-medium">
                                        Chuyên Ngành:
                                      </span>{" "}
                                      {teacher.major}
                                    </p>

                                    <p className="d-flex align-items-start">
                                      <i className="bi bi-briefcase-fill me-2 text-primary mt-1"></i>{" "}
                                      {/* Bootstrap Icon for briefcase */}
                                      <span className="fw-medium">
                                        Kinh nghiệm giảng dạy:
                                      </span>{" "}
                                      {teacher.experience_teacher}
                                    </p>
                                  </div>
                                  <div className="col-12 col-md-6">
                                    <h6 className="fw-bold mb-2 text-dark">
                                      Chứng chỉ:
                                    </h6>
                                    <Image
                                      style={{
                                        maxWidth: "250px",
                                        height: "auto",
                                        objectFit: "contain",
                                      }}
                                      width={250}
                                      height={250}
                                      className="img-fluid rounded shadow-sm border border-secondary"
                                      src={`${imageUrl}${teacher.certification}`}
                                      alt="certification"
                                    ></Image>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {success && <AlertSuccess message="Xử Lý Thành Công" />}
            </div>

            <footer className="text-center mt-5 text-muted text-sm">
              <p>&copy; 2025 Nền tảng Giáo dục. Tất cả quyền được bảo lưu.</p>
            </footer>

            {/* Custom CSS for smooth gradient and button animations */}
            <style>
              {`
        .font-sans {
          font-family: 'Inter', sans-serif;
        }
       
        .drop-shadow-lg {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }
        .bg-purple-100 {
          background-color: #ede9fe; /* light purple */
        }
        .text-purple-700 {
          color: #6d28d9; /* dark purple */
        }
        .animate-btn {
          transition: all 0.3s ease;
        }
        .animate-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .rounded-4 {
          border-radius: 1.5rem !important; /* Custom large border-radius */
        }
        .table-hover tbody tr:hover {
          background-color: #f5f5f5; /* Lighter hover effect */
        }
        `}
            </style>
          </div>
        </Box>
      </div>
    </>
  );
};

export default TeacherRequestPage;
