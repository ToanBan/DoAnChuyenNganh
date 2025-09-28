"use client";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import AlertSuccess from "@/app/components/share/alert_success";
interface Course {
  id: number;
  course_name: string;
  course_description: string;
  course_image: string;
  price: string;
  teacher: {
    id: string;
    name: string;
  };
}

const SearchPage = () => {
  const imageCourse = "http://localhost:5000/uploads/";
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const [courses, setCourses] = useState<Course[]>([]);
  const [success, setSuccess] = useState(false);
  const { refreshCartCount } = useCart();
  const SearchCourses = async () => {
    const res = await fetch("http://localhost:5000/api/courses/search", {
      method: "POST",
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    setCourses(data.message);
    console.log(data);
  };

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
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      await refreshCartCount();
      window.dispatchEvent(new Event("cart-updated"));
    } else {
      alert(data.message || "Có lỗi xảy ra!");
    }
  };

  useEffect(() => {
    if (query) {
      SearchCourses();
    }
  }, [query]);

  return (
    <>
      <section className={styles.sectionDark}>
        <div className="mb-2">
          <h2 style={{ fontSize: "50px", fontWeight: "700" }}>KHÓA HỌC</h2>
          <div className="d-flex justify-content-center">
            <p style={{ width: "700px", color: "#7f85a8" }}>
              SẢN PHẨM MÀ BẠN ĐÃ TÌM KIẾM
            </p>
          </div>
        </div>
        <div className={styles.courseGrid}>
          {courses.map((c, index) => (
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
      </section>

      {success && <AlertSuccess message="Thêm Giỏ Hàng Thành Công" />}
    </>
  );
};

export default SearchPage;
