"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  major: string;
}

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState<Teacher[] | null>(null);
  const imageUrl = "http://localhost:5000/uploads/";

  const GetTeacher = async () => {
    const res = await fetch("http://localhost:5000/api/teachers", {
      method: "GET",
      credentials: "include",
    });
    const data = await res.json();
    setTeachers(data.message);
  };

  useEffect(() => {
    GetTeacher();
  }, []);

  return (
    <>
      <div className="content">
        <div className="card shadow-lg rounded-3 p-4 w-100 max-w-4xl border border-primary-subtle">
          <h2 className="h2 fw-bolder text-center text-primary mb-4">
            Danh Sách Giáo Viên
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
                    Số ĐT
                  </th>
                  <th className="p-3 text-start small text-secondary text-uppercase">
                    Chuyên Ngành
                  </th>
                  <th className="p-3 text-start small text-secondary text-uppercase">
                    Trạng Thái
                  </th>
                </tr>
              </thead>
              <tbody>
                {teachers?.map((teacher) => (
                  <tr key={teacher.id}>
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
                    <td className="p-3 text-nowrap small text-muted">
                      {teacher.major}
                    </td>
                    <td className="p-3 text-nowrap">
                      <button className={`badge rounded-pill shadow-sm`}>
                        Hoạt Động
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeacherManagement;
