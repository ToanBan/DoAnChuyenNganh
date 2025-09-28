"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import AlertSuccess from "@/app/components/share/alert_success";
interface Course {
  id: string;
  course_name: string;
  course_image: string;
  price: string;
  teacher:{
    name:string
  }
}

const ConfirmationCourse = () => {
  const [course, setCourse] = useState<Course[] | null>(null);
  const [success, setSuccess] = useState(false);
  const imageUrl = "http://localhost:5000/uploads/";
  const GetCoursePending = async () => {
    const res = await fetch("http://localhost:5000/api/admin/course_pending", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    setCourse(data.message);
  };

  useEffect(() => {
    GetCoursePending();
  }, []);

  const handleStatus = async (
      e: React.MouseEvent<HTMLButtonElement>,
      status: string, 
      courseID:string,
    ) => {
      e.preventDefault();
      const res = await fetch(
        "http://localhost:5000/api/admin/course_request_status",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, courseID}),
          credentials: "include",
        }
      );
      const data = await res.json();
      console.log(data);
      if (res.status === 200) {
        setSuccess(true);
        GetCoursePending();
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }
    };
  

  return (
    <>
      <div className="content">
        <div className="card shadow-lg rounded-3 p-4 w-100 max-w-4xl border border-primary-subtle">
          <h2 className="h2 fw-bolder text-center text-primary mb-4">
            Xét Duyệt Khóa Học
          </h2>
          <div className="table-responsive">
            <table className="table table-hover table-bordered rounded-3 overflow-hidden">
              <thead className="table-light">
                <tr>
                  <th className="p-3 text-start small text-secondary text-uppercase rounded-top-left">
                    Ảnh Khóa Học
                  </th>
                  <th className="p-3 text-start small text-secondary text-uppercase">
                    Tên Khóa Học
                  </th>
                  <th className="p-3 text-start small text-secondary text-uppercase">
                    Giá Khóa Học
                  </th>
                  <th className="p-3 text-start small text-secondary text-uppercase">
                    Giáo Viên
                  </th>
                 
                  <th className="p-3 text-start small text-secondary text-uppercase">
                    Trạng Thái
                  </th>
                </tr>
              </thead>
              <tbody>
                {course?.map((course) => (
                  <tr key={course.id}>
                    <td className="p-3 text-nowrap">
                      <Image
                        width={48}
                        height={48}
                        alt="avatar-teacher"
                        style={{ width: "48px", height: "48px" }}
                        src={`${imageUrl}${course.course_image}`}
                        className="rounded-circle object-fit-cover border border-primary-subtle shadow-sm"
                      ></Image>
                    </td>
                    <td className="p-3 text-nowrap small fw-medium text-dark">
                      {course.course_name}
                    </td>
                    <td className="p-3 text-nowrap small text-muted">
                      {course.price}
                    </td>
                    <td className="p-3 text-nowrap small text-muted">
                      {course.teacher.name}
                    </td>
                    
                    <td className="p-3 text-nowrap">
                      <button onClick={(e) => handleStatus(e, "Approved", course.id)} className="btn btn-outline-primary">Chấp Nhận</button>
                      <button onClick={(e) => handleStatus(e, "Rejected", course.id)} className="btn btn-outline-danger ms-2">Từ Chối</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {success && <AlertSuccess message="Xử Lý Thành Công" />}
    </>
  );
};

export default ConfirmationCourse;
