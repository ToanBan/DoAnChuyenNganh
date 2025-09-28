"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

interface Course {
  id: string;
  course_name: string;
  price: string;
  status: number;
  course_image: string;
}

interface Teacher {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  courses: Course[];
}

const CourseByTeacher = () => {
  const [teachers, setTeachers] = useState<Teacher[] | null>(null);
  const [expandedTeacherId, setExpandedTeacherId] = useState<string | null>(
    null
  );
  const imageUrl = "http://localhost:5000/uploads/";

  const GetTeacherCourse = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/course_teacher",
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      setTeachers(data.message);
    } catch (error) {
      console.error("Error fetching teacher courses:", error);
      // Handle error, e.g., show a message to the user
    }
  };

  useEffect(() => {
    GetTeacherCourse();
  }, []);

  const handleToggleCourses = (teacherId: string) => {
    setExpandedTeacherId((prevId) => (prevId === teacherId ? null : teacherId));
  };

  return (
    <>
      <div className="content">
        <div className="card shadow-lg rounded-3 p-4 w-100 max-w-4xl border border-primary-subtle">
          <h2 className="h2 fw-bolder text-center text-primary mb-4">
            KHÓA HỌC THEO GIÁO VIÊN
          </h2>
          <div className="table-responsive">
            <table className="table table-hover table-bordered rounded-3 overflow-hidden">
              <thead className="table-light">
                <tr>
                  <th className="p-3 text-start small text-secondary text-uppercase rounded-top-left">
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
                {teachers?.map((teacher) => (
                  <React.Fragment key={teacher.id}>
                    <tr>
                      <td className="p-3 text-nowrap">
                        <Image
                          width={48}
                          height={48}
                          alt="avatar-teacher"
                          style={{ width: "48px", height: "48px" }}
                          src={`${imageUrl}${teacher.avatar}`}
                          className="rounded-circle object-fit-cover border border-primary-subtle shadow-sm"
                        ></Image>
                      </td>
                      <td className="p-3 text-nowrap small fw-medium text-dark">
                        {teacher.name}
                      </td>
                      <td className="p-3 text-nowrap small text-muted">
                        {teacher.email}
                      </td>
                      <td className="p-3 text-nowrap small text-muted">
                        {teacher.phone}
                      </td>
                      <td className="p-3 text-nowrap">
                        <button
                          onClick={() => handleToggleCourses(teacher.id)}
                          className="btn btn-outline-primary"
                        >
                          {expandedTeacherId === teacher.id
                            ? "Ẩn Các Khóa Học"
                            : "Xem Các Khóa Học"}
                        </button>
                      </td>
                    </tr>
                    {expandedTeacherId === teacher.id && (
                      <tr>
                        <td colSpan={5} className="p-0">
                          <div
                            className="collapse show" // Use 'show' class for Bootstrap collapse to be open by default when rendered
                            id={`teacherCourses-${teacher.id}`}
                          >
                            <div className="card card-body bg-light">
                              <h5 className="mb-3 text-primary">
                                Các khóa học của {teacher.name}:
                              </h5>
                              {teacher.courses && teacher.courses.length > 0 ? (
                                <ul className="list-group">
                                  {teacher.courses.map((course) => (
                                    <li
                                      key={course.id}
                                      className="list-group-item d-flex justify-content-between align-items-center"
                                    >
                                      <div className="d-flex gap-5">
                                        <Image
                                        className="rounded"
                                          width={40}
                                          height={40}
                                          alt={`${course.course_name}`}
                                          src={`${imageUrl}${course.course_image}`}
                                        ></Image>

                                        <div>
                                          <h6 className="mb-1">
                                            {course.course_name}
                                          </h6>
                                          <small className="text-muted">
                                            Giá: {course.price}
                                          </small>
                                        </div>
                                      </div>
                                      <span
                                        className={`badge rounded-pill ${
                                          course.status === 1
                                            ? "bg-success"
                                            : "bg-danger"
                                        }`}
                                      >
                                        {course.status === 1
                                          ? "Được Duyệt" : course.status === 0 ? "Đang Chờ": "Từ Chối"}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-muted fst-italic">
                                  Không có khóa học nào.
                                </p>
                              )}
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

export default CourseByTeacher;
