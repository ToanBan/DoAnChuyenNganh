"use client";
import React, { useEffect, useState } from "react";
import NavigationAdmin_Teacher from "@/app/components/share/NavigationAdmin";
import Image from "next/image";

interface Video {
  id: string;
  video_title: string;
}

interface Lecture {
  id: string;
  name_lecture: string;
}

interface Topic {
  id: string;
  topic_name: string;
  videos: Video[];
  lectures: Lecture[];
}

interface Course {
  id: string;
  course_name: string;
  course_image: string;
  price: string;
  course_description?: string;
  topics?: Topic[];
}

const CourseAccept = () => {
  const [course, setCourse] = useState<Course[] | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null); // ID course đang xem chi tiết
  const imageUrl = "http://localhost:5000/uploads/";

  const GetCourseAccept = async () => {
    const res = await fetch("http://localhost:5000/api/teacher_course_accept", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    setCourse(data.message);
  };

  const toggleDetail = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  useEffect(() => {
    GetCourseAccept();
  }, []);

  return (
    <>
      <NavigationAdmin_Teacher />
      <div className="content">
        <div className="card shadow-lg rounded-3 p-4 w-100 max-w-4xl border border-primary-subtle">
          <h2 className="h2 fw-bolder text-center text-primary mb-4">
            KHÓA HỌC ĐÃ ĐƯỢC PHÊ DUYỆT
          </h2>
          <div className="table-responsive">
            <table className="table table-hover table-bordered rounded-3 overflow-hidden">
              <thead className="table-light">
                <tr>
                  <th>Ảnh</th>
                  <th>Tên Khóa Học</th>
                  <th>Giá</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {course?.map((courseItem) => (
                  <React.Fragment key={courseItem.id}>
                    <tr>
                      <td>
                        <Image
                          width={48}
                          height={48}
                          alt="avatar-teacher"
                          style={{ width: "48px", height: "48px" }}
                          src={`${imageUrl}${courseItem.course_image}`}
                          className="rounded-circle object-fit-cover border border-primary-subtle shadow-sm"
                        />
                      </td>
                      <td>{courseItem.course_name}</td>
                      <td>{courseItem.price}</td>
                      <td>
                        <button
                          onClick={() => toggleDetail(courseItem.id)}
                          className="btn btn-outline-primary"
                        >
                          {expandedId === courseItem.id
                            ? "Ẩn Chi Tiết"
                            : "Xem Chi Tiết"}
                        </button>
                      </td>
                    </tr>

                    {expandedId === courseItem.id && (
                      <tr>
                        <td colSpan={4}>
                          <div className="card border-0 shadow-sm">
                            <div className="card-body">
                              <h5 className="card-title text-primary mb-3">
                                📘 Chi tiết khóa học
                              </h5>

                              <p className="mb-3">
                                <strong>Mô tả:</strong>{" "}
                                <span className="text-muted">
                                  {courseItem.course_description || "Không có"}
                                </span>
                              </p>

                              <div>
                                <strong>Chủ đề:</strong>
                                {courseItem.topics &&
                                courseItem.topics.length > 0 ? (
                                  <ul className="list-group list-group-flush mt-2">
                                    {courseItem.topics.map((topic) => (
                                      <li
                                        key={topic.id}
                                        className="list-group-item"
                                      >
                                        <span className="fw-bold text-success">
                                          {topic.topic_name}
                                        </span>
                                        <ul className="mt-2 ps-3 border-start border-2 border-success">
                                          {topic.videos?.map((video) => (
                                            <li key={video.id} className="mb-1">
                                              🎥{" "}
                                              <span className="text-dark">
                                                {video.video_title}
                                              </span>
                                            </li>
                                          ))}
                                          {topic.lectures?.map((lecture) => (
                                            <li
                                              key={lecture.id}
                                              className="mb-1"
                                            >
                                              📘{" "}
                                              <span className="text-dark">
                                                {lecture.name_lecture}
                                              </span>
                                            </li>
                                          ))}
                                          {!topic.videos?.length &&
                                            !topic.lectures?.length && (
                                              <li className="text-muted fst-italic">
                                                Không có nội dung
                                              </li>
                                            )}
                                        </ul>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-muted fst-italic mt-2">
                                    Không có chủ đề nào
                                  </p>
                                )}
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

export default CourseAccept;
