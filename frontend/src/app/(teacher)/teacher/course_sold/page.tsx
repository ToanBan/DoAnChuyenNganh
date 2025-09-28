"use client";
import React, { useEffect, useState } from "react";
import NavigationAdmin_Teacher from "@/app/components/share/NavigationAdmin";
import Image from "next/image";

interface Course {
  course_id: string;
  total_quantity: string;
  Course: {
    id: string;
    course_name: string;
    price: string;
    course_image: string;
  };
}

const CoursSold = () => {
  const [course, setCourse] = useState<Course[] | null>(null);
  const imageUrl = "http://localhost:5000/uploads/";
  const GetCoursePurchased = async () => {
    const res = await fetch(
      "http://localhost:5000/api/teacher_purchasedbyteacher",
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.json();
    setCourse(data.message);
  };

  useEffect(() => {
    GetCoursePurchased();
  }, []);

  return (
    <>
      <NavigationAdmin_Teacher />
      <div className="content">
        <div className="card shadow-lg rounded-3 p-4 w-100 max-w-4xl border border-primary-subtle">
          <h2 className="h2 fw-bolder text-center text-primary mb-4">
            KHÓA HỌC ĐÃ ĐƯỢC MUA
          </h2>
          <div className="table-responsive">
            <table className="table table-hover table-bordered rounded-3 overflow-hidden">
              <thead className="table-light">
                <tr>
                  <th>Ảnh</th>
                  <th>Tên Khóa Học</th>
                  <th>Giá</th>
                  <th>Số Lượng Bán</th>
                </tr>
              </thead>
              <tbody>
                {course?.map((courseItem) => (
                  <React.Fragment key={courseItem.course_id}>
                    <tr>
                      <td>
                        <Image
                          width={48}
                          height={48}
                          alt="avatar-teacher"
                          style={{ width: "48px", height: "48px" }}
                          src={`${imageUrl}${courseItem.Course.course_image}`}
                          className="rounded-circle object-fit-cover border border-primary-subtle shadow-sm"
                        />
                      </td>
                      <td>{courseItem.Course.course_name}</td>
                      <td>{courseItem.Course.price}</td>
                      <td>{courseItem.total_quantity}</td>
                    </tr>

                 
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

export default CoursSold;
