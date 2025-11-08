"use client";
import React, { useEffect, useState } from "react";
import NavigationAdmin_Teacher from "@/app/components/share/NavigationAdmin";
import Image from "next/image";

interface Student {
  course_id: string;
  course_image: string;
  course_name: string;
  progress_percent: string;
  student_avatar: string;
  student_email: string;
  student_phone: string;
  student_name: string;
}

const TeacherProgressPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(
    null
  );
  const imageUrl = "http://localhost:5000/uploads/";

  const GetStudentsProgress = async () => {
    const res = await fetch("http://localhost:5000/api/topic_progress", {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setStudents(data.data);
  };

  const handleProgressCourse = (studentId: string) => {
    setExpandedStudentId((prevId) => (prevId === studentId ? null : studentId));
  };

  useEffect(() => {
    GetStudentsProgress();
  }, []);

  return (
    <>
      <NavigationAdmin_Teacher />
      <div className="content">
        <div className="card shadow-lg rounded-3 p-4 w-100 max-w-4xl border border-primary-subtle">
          <h2 className="h2 fw-bolder text-center text-primary mb-4">
            THEO DÕI TIẾN ĐỘ HỌC VIÊN
          </h2>
          <div className="table-responsive">
            <table className="table table-hover table-bordered rounded-3 overflow-hidden">
              <thead className="table-light">
                <tr>
                  <th className="p-3 text-start small text-secondary text-uppercase">
                    Ảnh
                  </th>
                  <th className="p-3 text-start small text-secondary text-uppercase">
                    Tên
                  </th>
                  <th className="p-3 text-start small text-secondary text-uppercase">
                    Email
                  </th>
                  <th className="p-3 text-start small text-secondary text-uppercase">
                    Số Điện Thoại
                  </th>
                  <th className="p-3 text-start small text-secondary text-uppercase">
                    Hành Động
                  </th>
                </tr>
              </thead>
              <tbody>
                {students?.map((student) => (
                  <React.Fragment key={`${student.course_id}-${student.student_email}`}>
                    <tr>
                      <td className="p-3 text-nowrap">
                        <Image
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                          }}
                          className="img-fluid rounded-circle mb-4 border border-3 border-info shadow-sm"
                          src={
                            student.student_avatar
                              ? `${imageUrl}${student.student_avatar}`
                              : "https://www.lewesac.co.uk/wp-content/uploads/2017/12/default-avatar.jpg"
                          }
                          width={30}
                          height={30}
                          alt={`${student.student_avatar}`}
                        />
                      </td>
                      <td className="p-3 small fw-medium text-dark">
                        {student.student_name}
                      </td>
                      <td className="p-3 small text-muted">
                        {student.student_email}
                      </td>
                      <td className="p-3 small text-muted">
                        {student.student_phone || "Chưa Cập Nhật SĐT"}
                      </td>
                      <td className="p-3 text-nowrap">
                        <button
                          onClick={() =>
                            handleProgressCourse(student.course_id)
                          }
                          className="btn btn-outline-primary"
                        >
                          {expandedStudentId === student.course_id
                            ? "Ẩn Tiến Độ"
                            : "Xem Tiến Độ"}
                        </button>
                      </td>
                    </tr>

                    {expandedStudentId === student.course_id && (
                      <tr>
                        <td colSpan={5} className="p-0">
                          <div className="card card-body bg-light">
                            <h5 className="mb-3 text-primary">
                              Tiến độ học của {student.student_name}:
                            </h5>

                            {/* --- Nội dung tĩnh --- */}
                            <div className="d-flex align-items-center gap-4">
                              <Image
                                src={
                                  student.course_image
                                    ? `${imageUrl}${student.course_image}`
                                    : "https://via.placeholder.com/120x80?text=Course+Image"
                                }
                                width={120}
                                height={80}
                                className="rounded border shadow-sm"
                                alt="Course"
                                style={{ objectFit: "cover" }}
                              />
                              <div>
                                <h6 className="fw-bold text-dark mb-2">
                                  {student.course_name ||
                                    "Khóa học mẫu: Lập trình ReactJS"}
                                </h6>
                                <div
                                  className="progress"
                                  style={{ height: "20px", width: "300px" }}
                                >
                                  <div
                                    className="progress-bar bg-success"
                                    role="progressbar"
                                    style={{
                                      width: `${student.progress_percent}%`,
                                    }}
                                    aria-valuenow={75}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                  >
                                    {student.progress_percent}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeacherProgressPage;
