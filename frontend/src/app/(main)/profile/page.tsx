"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import AlertSuccess from "@/app/components/share/alert_success";
import axios from "../../../../lib/api/axios";
import { BookOpen, User, Layers } from "lucide-react";
import Link from "next/link";
interface UserProps {
  id: string;
  username: string;
  email: string;
  description: string;
  address: string;
  avatar: string;
  role: string;
}

interface Courses {
  id: string;
  course_name: string;
  course_description: string;
  course_image: string;
  InvoiceItems: [];
  teacher: {
    id: string;
    name: string;
  };
}

interface TopicPurchases {
  id: string;
  topic_id: string;
  topic: {
    id: string;
    topic_name: string;
    topic_description: string;
    course: {
      id: string;
      course_name: string;
      teacher: {
        id: string;
        User: {
          id: string;
          username: string;
        };
      };
    };
  };
}

interface ForumProps {
  userId: string;
  forumId: string;
  forum: {
    id: string;
    name: string;
    description: string;
  };
}

const ProfilePage = () => {
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<UserProps | null>(null);
  const [courses, setCourses] = useState<Courses[]>([]);
  const [editUser, setEditUser] = useState({
    username: "",
    address: "",
    description: "",
  });
  const [TopicPurchase, setTopicPurchase] = useState<TopicPurchases[]>([]);
  const imageUrl = "http://localhost:5000/uploads/";
  const [imgSrc, setImgSrc] = useState(`${imageUrl}${user?.avatar}`);
  const [forums, setForums] = useState<ForumProps[]>([]);
  const bootstrapRef = useRef<any>(null);
  useEffect(() => {
    //@ts-ignore
    import("bootstrap/dist/js/bootstrap.bundle.min.js").then((bs) => {
      bootstrapRef.current = bs;
    });
  }, []);

  const handleEditProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const res = await fetch("http://localhost:5000/api/user/edit", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    if (res.status === 200) {
      setSuccess(true);
      const modalElement = document.getElementById("editProfileModal");
      if (modalElement && bootstrapRef.current) {
        const modalInstance =
          bootstrapRef.current.Modal.getInstance(modalElement);
        modalInstance?.hide();
      }

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }
    GetAuthUser();
  };

  const handleRegisterTeacher = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const res = await fetch("http://localhost:5000/api/teacher/register", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    if (res.status === 200) {
      setSuccess(true);
      const modalElement = document.getElementById("teacherRegisterModal");
      if (modalElement && bootstrapRef.current) {
        const modalInstance =
          bootstrapRef.current.Modal.getInstance(modalElement);
        modalInstance?.hide();
      }
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }
  };

  const GetAuthUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/user", {
        withCredentials: true,
      });
      const data = res.data;
      if (res.status === 200) {
        setUser(data.message);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      return;
    }
  };

  const GetCourseBougth = async () => {
    const res = await fetch("http://localhost:5000/api/courses_bought", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    setCourses(data.message);
  };

  const GetTopicsPurchases = async () => {
    const res = await fetch("http://localhost:5000/api/topics_purchased", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    console.log(data);
    setTopicPurchase(data.message);
  };

  const GetForumJoined = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/forum", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setForums(data.message);
      }
    } catch (error) {
      console.error(error);
      return setForums([]);
    }
  };

  useEffect(() => {
    GetAuthUser();
    GetCourseBougth();
    GetTopicsPurchases();
    GetForumJoined();
  }, []);

  useEffect(() => {
    if (user) {
      setEditUser({
        username: user.username || "",
        address: user.address || "",
        description: user.description || "",
      });
    }
  }, [user]);

  return (
    <>
      <div className="profile-container">
        <div className="profile-header">
          <Image
            style={{
              width: "140px",
              height: "140px",
              objectFit: "cover",
            }}
            className="img-fluid rounded-circle mb-4 border border-3 border-info shadow-sm me-5"
            src={imgSrc}
            width={200}
            height={200}
            alt={`${user?.username}`}
            onError={() =>
              setImgSrc(
                "https://www.lewesac.co.uk/wp-content/uploads/2017/12/default-avatar.jpg"
              )
            }
          />

          <div className="profile-info">
            <div className="d-flex align-items-center gap-3">
              <h1 className="username">{user?.username}</h1>
              <Image
                style={{ cursor: "pointer" }}
                src={"https://cdn-icons-png.flaticon.com/128/1159/1159633.png"}
                width={30}
                height={30}
                alt="btn-edit"
                data-bs-toggle="modal"
                data-bs-target="#editProfileModal"
              ></Image>
            </div>

            <div className="d-flex gap-2 align-items-center">
              {user?.role !== "teacher" ? (
                <button
                  data-bs-toggle="modal"
                  data-bs-target="#teacherRegisterModal"
                  className="btn btn-outline-danger mb-2 mt-2"
                >
                  Đăng Ký Giáo Viên
                </button>
              ) : (
                ""
              )}
            </div>
            <div className="bio">
              <br />
              {user?.description ? user.description : "Thêm Mô Tả"}
              <br />
              <strong>{user?.email}</strong>
            </div>
          </div>
        </div>

        <div className="container my-5">
          {" "}
          {/* Added a container for better centering and spacing */}
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {" "}
            {/* Responsive grid */}
            {courses.length > 0 ? (
              courses.map((course) => (
                <div className="col" key={course.id}>
                  {" "}
                  {/* Use col for responsive grid items */}
                  <div className="card h-100 shadow-sm">
                    {" "}
                    {/* Added shadow and h-100 for consistent height */}
                    <Image
                      src={`${imageUrl}${course.course_image}`}
                      className="card-img-top"
                      alt={course.course_name}
                      width={300}
                      height={200}
                      style={{ objectFit: "cover" }} // Ensures images cover the area nicely
                    />
                    <div className="card-body d-flex flex-column">
                      {" "}
                      {/* Use flex-column for sticky button */}
                      <h5 className="card-title text-primary">
                        {course.course_name}
                      </h5>{" "}
                      {/* Primary color for title */}
                      <p className="card-text text-muted flex-grow-1">
                        {" "}
                        {/* Muted text and flex-grow-1 for description */}
                        {course.course_description.slice(0, 100)}...
                      </p>
                      <p className="card-text">
                        <small className="text-success">
                          Giáo Viên: {course.teacher.name}
                        </small>{" "}
                        {/* Smaller, success-colored text for teacher */}
                      </p>
                      <div className="mt-auto">
                        {" "}
                        {/* Pushes the button to the bottom */}
                        <a
                          href={`/course/${course.id}`}
                          className="btn btn-primary w-100"
                        >
                          {" "}
                          {/* Full width primary button */}
                          Học Ngay
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                {" "}
                <div className="alert alert-info text-center" role="alert">
                  Không có khóa học nào đã mua.
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="container my-5">
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {TopicPurchase.length > 0 ? (
              TopicPurchase.map((topic) => (
                <div className="col" key={topic.id}>
                  <div className="card h-100 border-0 shadow rounded-4">
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title d-flex align-items-center gap-2 text-dark">
                        <BookOpen size={20} /> {topic.topic.topic_name}
                      </h5>
                      <p className="card-text text-muted mb-1 d-flex align-items-center gap-2">
                        <User size={16} /> Giáo viên:{" "}
                        <strong>
                          {topic.topic.course.teacher.User.username}
                        </strong>
                      </p>
                      <p className="card-text text-muted d-flex align-items-center gap-2">
                        <Layers size={16} /> Khóa học:{" "}
                        <strong>{topic.topic.course.course_name}</strong>
                      </p>
                      <div className="mt-auto pt-3">
                        <Link
                          href={`/course/topic/${topic.topic_id}`}
                          className="btn btn-primary w-100"
                        >
                          Học ngay
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p></p>
            )}
          </div>
        </div>

        <div
          className="container my-5"
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "20px",
            backgroundColor: "#f8f9fa",
            borderRadius: "16px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
          }}
        >
          <h2
            style={{
              textAlign: "left",
              color: "#0d6efd",
              marginBottom: "40px",
              fontWeight: "700",
              fontSize: "1.8rem",
            }}
          >
            Diễn đàn bạn đã tham gia
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "24px",
            }}
          >
            {forums.length > 0 ? (
              forums.map((item) => (
                <div
                  key={item.forum.id}
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    boxShadow: "0 3px 12px rgba(0,0,0,0.1)",
                    padding: "20px",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-6px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  <h4
                    style={{
                      color: "#0d6efd",
                      marginBottom: "10px",
                      fontWeight: "700",
                    }}
                  >
                    {item.forum.name}
                  </h4>

                  <p
                    style={{
                      color: "#6c757d",
                      fontSize: "0.95rem",
                      lineHeight: "1.5",
                      marginBottom: "12px",
                    }}
                  >
                    {item.forum.description}
                  </p>

                  <Link href={`/forum/${item.forumId}`}>
                    <button
                      style={{
                        border: "2px solid #0d6efd",
                        color: "#0d6efd",
                        backgroundColor: "transparent",
                        borderRadius: "30px",
                        padding: "8px 16px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#0d6efd";
                        e.currentTarget.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#0d6efd";
                      }}
                    >
                      Vào diễn đàn
                    </button>
                  </Link>
                </div>
              ))
            ) : (
              <div
                style={{
                  textAlign: "center",
                  color: "#6c757d",
                  fontStyle: "italic",
                  gridColumn: "1 / -1",
                }}
              >
                Bạn chưa tham gia diễn đàn nào 😢
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="teacherRegisterModal"
        tabIndex={-1}
        aria-labelledby="teacherRegisterModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header modal-header-edit">
              <h5 className="modal-title" id="teacherRegisterModalLabel">
                Register as Teacher
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form style={{ width: "100%" }} onSubmit={handleRegisterTeacher}>
                <div className="mb-3" style={{ textAlign: "left" }}>
                  <label htmlFor="fullName" className="form-label">
                    Tên Của Bạn
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="fullName"
                    required
                    name="fullName"
                  />
                </div>
                <div className="mb-3" style={{ textAlign: "left" }}>
                  <label htmlFor="email" className="form-label">
                    Địa Chỉ Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    required
                  />
                </div>
                <div className="mb-3" style={{ textAlign: "left" }}>
                  <label htmlFor="phone" className="form-label">
                    Số Điện Thoại
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phone"
                    pattern="[0-9]{10,}"
                    name="phone"
                    required
                  />
                </div>
                <div className="mb-3" style={{ textAlign: "left" }}>
                  <label htmlFor="birthday" className="form-label">
                    Ngày Sinh
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="birthday"
                    name="birthday"
                  />
                </div>

                <div className="mb-3" style={{ textAlign: "left" }}>
                  <label htmlFor="address" className="form-label">
                    Địa Chỉ
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="address"
                    required
                    name="address"
                  />
                </div>
                <div className="mb-3" style={{ textAlign: "left" }}>
                  <label htmlFor="profilePic" className="form-label">
                    Avatar
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="profilePic"
                    name="profilePic"
                    accept="image/*"
                  />
                </div>

                <div className="mb-3" style={{ textAlign: "left" }}>
                  <label htmlFor="certification" className="form-label">
                    Các Chứng Chỉ
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    name="certification"
                    multiple
                  />
                </div>
                <div className="mb-3" style={{ textAlign: "left" }}>
                  <label htmlFor="experience" className="form-label">
                    Kinh Nghiệm Giảng Dạy
                  </label>
                  <textarea
                    className="form-control"
                    id="experience"
                    rows={4}
                    name="experience"
                    required
                  ></textarea>
                </div>

                <div className="mb-3" style={{ textAlign: "left" }}>
                  <label htmlFor="major" className="form-label">
                    Chuyên Ngành
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="major"
                    name="major"
                    required
                  />
                </div>

                <div className="mb-3" style={{ textAlign: "left" }}>
                  <div className="form-check d-flex align-items-center gap-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="terms"
                      required
                    />
                    <label className="form-check-label" htmlFor="terms">
                      I agree to the terms and conditions
                    </label>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">
                  Submit Application
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {success && <AlertSuccess message="Đăng Ký Giáo Viên Thành Công" />}

      <div
        className="modal fade"
        id="editProfileModal"
        tabIndex={-1}
        aria-labelledby="editProfileModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header modal-header-edit">
              <h5 className="modal-title" id="editProfileModalLabel">
                <i className="fas fa-user-circle me-2"></i>Chỉnh sửa hồ sơ
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body p-4">
              <form onSubmit={handleEditProfile} style={{ width: "100%" }}>
                <div className="mb-3" style={{ textAlign: "left" }}>
                  <label htmlFor="username" className="form-label">
                    Tên người dùng
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    placeholder="Nhập tên người dùng"
                    value={editUser.username}
                    name="username"
                    onChange={(e) =>
                      setEditUser({ ...editUser, username: e.target.value })
                    }
                  />
                </div>

                <div className="mb-3" style={{ textAlign: "left" }}>
                  <label htmlFor="address" className="form-label">
                    Địa Chỉ
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="address"
                    placeholder="Nhập tên người dùng"
                    name="address"
                    value={editUser?.address || ""}
                    onChange={(e) =>
                      setEditUser({ ...editUser, address: e.target.value })
                    }
                  />
                </div>

                <div className="mb-3" style={{ textAlign: "left" }}>
                  <label htmlFor="description" className="form-label">
                    Mô tả
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    rows={4}
                    name="description"
                    placeholder="Mô tả về bạn"
                    value={editUser.description || ""}
                    onChange={(e) =>
                      setEditUser({ ...editUser, description: e.target.value })
                    }
                  ></textarea>
                </div>

                <div className="mb-4" style={{ textAlign: "left" }}>
                  <label htmlFor="profileImage" className="image-upload-label">
                    Thay đổi ảnh
                  </label>
                  <input
                    className="form-control"
                    type="file"
                    id="profileImage"
                    name="profileImage"
                    accept="image/*"
                  />
                </div>
                <div className="d-flex justify-content-end">
                  <button type="submit" className="btn btn-primary">
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {success && <AlertSuccess message="Đăng Ký Giáo Viên Thành Công" />}
    </>
  );
};

export default ProfilePage;
