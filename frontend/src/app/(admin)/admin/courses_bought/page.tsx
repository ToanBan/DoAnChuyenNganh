'use client'

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface Course {
  id: string;
  course_name: string;
  course_image: string;
  price: string;
  Course:{
    id:string,
    course_image:string,
    teacher:{
        name:string
    }
  }
}

const BoughtCourse = () => {
  const [course, setCourse] = useState<Course[] | null>(null);
  const [success, setSuccess] = useState(false);
  const imageUrl = "http://localhost:5000/uploads/";
  const GetCourseBought = async () => {
    const res = await fetch("http://localhost:5000/api/admin/courses_bought", {
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
    GetCourseBought();
  }, []);
  return (
    <>
      <div className="content">
        <div className="card shadow-lg rounded-3 p-4 w-100 max-w-4xl border border-primary-subtle">
          <h2 className="h2 fw-bolder text-center text-primary mb-4">
            CÁC KHÓA HỌC ĐƯỢC MUA
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
                        src={`${imageUrl}${course.Course.course_image}`}
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
                      {course.Course.teacher.name}
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

export default BoughtCourse;
