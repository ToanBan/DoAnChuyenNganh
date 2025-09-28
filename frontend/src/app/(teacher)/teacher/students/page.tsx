"use client";
import React, { useEffect, useState } from "react";
import NavigationAdmin_Teacher from "@/app/components/share/NavigationAdmin";
import Image from "next/image";
interface InvoiceItem {
  id: string;
  Course: {
    id: string;
    course_name: string;
    course_image: string;
    price:string
  };
}

interface Invoice {
  id: string;
  total: string;
  InvoiceItems: InvoiceItem[];
}

interface Student {
  id: string;
  username: string;
  avatar: string;
  email: string;
  phone: string;
  invoices: Invoice[];
}

const StudentTeacherPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(
    null
  );
  
  const imageUrl = "http://localhost:5000/uploads/";
  const GetStudents = async () => {
    const res = await fetch("http://localhost:5000/api/teacher_students", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    setStudents(data.message);
  };

  const handleToggleCourses = (studentId: string) => {
    setExpandedStudentId((prevId) => (prevId === studentId ? null : studentId));
  };

  useEffect(() => {
    GetStudents();
  }, []);

  return (
    <>
      <NavigationAdmin_Teacher />
      <div className="content">
        <div className="card shadow-lg rounded-3 p-4 w-100 max-w-4xl border border-primary-subtle">
          <h2 className="h2 fw-bolder text-center text-primary mb-4">
            DANH SÁCH HỌC VIÊN ĐÃ MUA KHÓA HỌC
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
                {students?.map((student) => (
                  <React.Fragment key={student.id}>
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
                            student.avatar
                              ? `${imageUrl}${student.avatar}`
                              : "https://www.lewesac.co.uk/wp-content/uploads/2017/12/default-avatar.jpg"
                          }
                          width={30}
                          height={30}
                          alt={`${student.avatar}`}
                        />
                      </td>
                      <td className="p-3 text-nowrap small fw-medium text-dark">
                        {student.username}
                      </td>
                      <td className="p-3 text-nowrap small text-muted">
                        {student.email}
                      </td>
                      <td className="p-3 text-nowrap small text-muted">
                        {student.phone ? student.phone : "Chưa Cập Nhật SĐT"}
                      </td>
                      <td className="p-3 text-nowrap">
                        <button
                          onClick={() => handleToggleCourses(student.id)}
                          className="btn btn-outline-primary"
                        >
                          {expandedStudentId === student.id
                            ? "Ẩn Các Khóa Học"
                            : "Xem Các Khóa Học"}
                        </button>
                      </td>
                    </tr>

                    {expandedStudentId === student.id && (
                      <tr>
                        <td colSpan={5} className="p-0">
                          <div className="card card-body bg-light">
                            <h5 className="mb-3 text-primary">
                              Các khóa học của {student.username}:
                            </h5>
                            {student.invoices && student.invoices.length > 0 ? (
                              <ul className="list-group">
                                {student.invoices.flatMap((invoice) =>
                                  invoice.InvoiceItems.map((item) => (
                                    <li
                                      key={item.id}
                                      className="list-group-item d-flex justify-content-between align-items-center"
                                    >
                                      <div className="d-flex gap-4">
                                        <Image
                                          className="rounded"
                                          width={40}
                                          height={40}
                                          alt={item.Course.course_name}
                                          src={`${imageUrl}${item.Course.course_image}`}
                                        />
                                        <div>
                                          <h6 className="mb-1">
                                            {item.Course.course_name}
                                          </h6>
                                          <small className="text-muted">
                                            Giá:{" "}
                                            {item.Course.price.toLocaleString()}
                                            đ
                                          </small>
                                        </div>

                                        
                                      </div>
                                    </li>
                                  ))
                                )}
                              </ul>
                            ) : (
                              <p className="text-muted fst-italic">
                                Học viên chưa mua khóa học nào.
                              </p>
                            )}
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

export default StudentTeacherPage;
