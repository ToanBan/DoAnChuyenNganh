"use client";

import React, { useEffect, useState } from "react"; // Import useState
import styles from "./page.module.css";
import Chatbox from "@/app/components/Chatbox";
import Image from "next/image";
import Footer from "@/app/components/share/Footer";
import GetCourse from "@/app/api/GetCourse";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import AlertSuccess from "@/app/components/share/alert_success";
interface Course {
  id: number;
  course_description: string;
  price: string;
  course_image: string;
  course_name: string;
  teacher: {
    name: string;
  };
}

const CoursePage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;
  const [courses, setCourses] = useState<Course[] | []>([]);
  const totalPages = Math.ceil(courses.length / coursesPerPage);
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);
  const imageCourse = "http://localhost:5000/uploads/";
  const [success, setSuccess] = useState(false);
  const { refreshCartCount } = useCart();
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    const fetchCourses = async () => {
      const data = await GetCourse();
      setCourses(data);
    };
    fetchCourses();
  }, []);

  const handleAddToCart = async (courseId: number) => {
    const res = await fetch("http://localhost:5000/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ courseId, quantity: 1 }),
      credentials: "include",
    });

    const data = await res.json();
    if (res.ok) {
      setSuccess(true);
      refreshCartCount();
      setTimeout(()=> {
        setSuccess(false);
      }, 3000);
    } else {
      alert(data.message || "Có lỗi xảy ra!");
    }
  };

  return (
    <>
      <section className={styles.sectionDark}>
        <div className="mb-2">
          <h2 style={{ fontSize: "50px", fontWeight: "700" }}>KHÓA HỌC</h2>
          <div className="d-flex justify-content-center">
            <p style={{ width: "700px", color: "#7f85a8" }}>
              Khám phá các khóa học chất lượng cao được thiết kế để nâng cao kỹ
              năng và kiến thức của bạn. Từ lập trình, thiết kế đến kinh doanh –
              hãy chọn khóa học phù hợp để phát triển sự nghiệp và đam mê của
              bạn.
            </p>
          </div>
        </div>
        <div className={styles.courseGrid}>
          {currentCourses.map((c, index) => (
            <div
              key={c.id}
              className={styles.courseCard}
              data-aos="zoom-in"
              data-aos-delay={index * 100}
            >
              <Image
                src={`${imageCourse}${c.course_image}`}
                width={400}
                height={225}
                alt={c.course_name}
                className={styles.courseImage}
                style={{ width: "100%", objectFit: "cover" }}
              />
              <div className={styles.courseInfo}>
                <h3>{c.course_name}</h3>
                <p>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(Number(c.price))}
                </p>
                <p>Giảng viên: {c.teacher.name}</p>

                <div className={styles.courseActions}>
                  <Link
                    className={`text-decoration-none ${styles.btnSecondary}`}
                    href={`/courses/${c.id}`}
                  >
                    Xem Chi Tiết
                  </Link>

                  <button
                    onClick={() => handleAddToCart(c.id)}
                    className={styles.btnRed}
                  >
                    Thêm Giỏ Hàng
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && ( // Only show pagination if more than 1 page
          <div className={styles.pagination}>
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={styles.paginationButton}
            >
              Trang trước
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={`${styles.paginationButton} ${
                  currentPage === index + 1 ? styles.activePage : ""
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={styles.paginationButton}
            >
              Trang sau
            </button>
          </div>
        )}
      </section>

      <div className="container-fluid my-5 p-4 p-md-5 bg-white rounded-4 shadow-lg full-width-section">
        <div className="row g-4 justify-content-around align-items-stretch">
          <div className="col-12 col-md-6 col-lg-3">
            <div className="feature-card d-flex flex-column align-items-center text-center p-4 bg-primary-subtle rounded-4 shadow-sm">
              <div className="icon-container text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-book-open"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <h3 className="h5 fw-semibold text-dark mb-2">
                Giáo trình toàn diện
              </h3>
              <p className="text-secondary small">
                Khám phá các khóa học được thiết kế kỹ lưỡng, bao gồm mọi khía
                cạnh bạn cần để thành công.
              </p>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <div className="feature-card d-flex flex-column align-items-center text-center p-4 bg-success-subtle rounded-4 shadow-sm">
              <div className="icon-container text-success">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-laptop"
                >
                  <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.93 1.45H3.65a1 1 0 0 1-.93-1.45L4 16" />
                </svg>
              </div>
              <h3 className="h5 fw-semibold text-dark mb-2">
                Học trực tuyến linh hoạt
              </h3>
              <p className="text-secondary small">
                Học mọi lúc, mọi nơi theo lịch trình của bạn với nền tảng trực
                tuyến tiện lợi của chúng tôi.
              </p>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <div className="feature-card d-flex flex-column align-items-center text-center p-4 bg-info-subtle rounded-4 shadow-sm">
              <div className="icon-container text-info">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-users"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="h5 fw-semibold text-dark mb-2">
                Hỗ trợ cộng đồng
              </h3>
              <p className="text-secondary small">
                Kết nối với những người học khác và nhận sự hỗ trợ từ các chuyên
                gia trong cộng đồng của chúng tôi.
              </p>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <div className="feature-card d-flex flex-column align-items-center text-center p-4 bg-warning-subtle rounded-4 shadow-sm">
              <div className="icon-container text-warning">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-award"
                >
                  <circle cx="12" cy="8" r="7" />
                  <path d="M8.21 13.89 7 22l5-3 5 3-1.21-8.11" />
                </svg>
              </div>
              <h3 className="h5 fw-semibold text-dark mb-2">
                Chứng chỉ hoàn thành
              </h3>
              <p className="text-secondary small">
                Nhận chứng chỉ được công nhận sau khi hoàn thành khóa học, nâng
                cao hồ sơ của bạn.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {success && <AlertSuccess message="Thêm Giỏ Hàng Thành Công"/>}
      <Footer />
      <Chatbox />
    </>
  );
};

export default CoursePage;
