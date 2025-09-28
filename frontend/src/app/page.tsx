"use client";

import React, { useState, useEffect, useRef, use } from "react";
import Image from "next/image";
import NavigationMain from "./components/share/NavigationMain";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import styles from "./page.module.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Footer from "./components/share/Footer";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
import GetCourse from "./api/GetCourse";
import { useCart } from "./context/CartContext";
import AlertSuccess from "./components/share/alert_success";

interface Slide {
  title: string;
  desc: string;
  buttonText: string;
  bgImage: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

const slides: Slide[] = [
  {
    title: "Học Hỏi Mọi Lúc, Mọi Nơi",
    desc: "Khám phá hàng ngàn khóa học chất lượng cao từ các chuyên gia hàng đầu thế giới. Nâng tầm kiến thức và kỹ năng của bạn ngay hôm nay!",
    buttonText: "Khám Phá Khóa Học",
    bgImage: "https://themewagon.github.io/ultras/images/banner1.jpg", // Placeholder
    secondaryButtonText: "Tìm Hiểu Thêm",
    secondaryButtonLink: "#",
  },
  {
    title: "Phát Triển Kỹ Năng Mới",
    desc: "Với các khóa học đa dạng từ công nghệ, kinh doanh đến sáng tạo, bạn sẽ luôn tìm thấy điều mình cần.",
    buttonText: "Khám Phá Khóa Học",
    bgImage: "https://themewagon.github.io/famms/images/slider-bg.jpg", // Placeholder
    secondaryButtonText: "Tìm Hiểu Thêm",
    secondaryButtonLink: "#",
  },
];

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

interface WhyUsItem {
  icon: string;
  title: string;
  description: string;
}

const whyUsItems: WhyUsItem[] = [
  {
    icon: "✨",
    title: "Nội Dung Chất Lượng Cao",
    description:
      "Các khóa học được xây dựng bởi đội ngũ chuyên gia hàng đầu, đảm bảo kiến thức chuyên sâu và tính ứng dụng cao.",
  },
  {
    icon: "🚀",
    title: "Lộ Trình Học Tập Cá Nhân Hóa",
    description:
      "Hệ thống gợi ý thông minh giúp bạn tìm được khóa học phù hợp nhất với mục tiêu và trình độ của mình.",
  },
  {
    icon: "💬",
    title: "Cộng Đồng Hỗ Trợ Tận Tình",
    description:
      "Tham gia diễn đàn sôi nổi, nhận hỗ trợ trực tiếp từ giảng viên và kết nối với hàng ngàn học viên khác.",
  },
];

interface Testimonial {
  quote: string;
  author: string;
  course: string;
  avatarUrl: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      '"Khóa học lập trình web thực sự tuyệt vời! Tôi đã học được rất nhiều kiến thức bổ ích và có thể tự tin xây dựng trang web của riêng mình."',
    author: "Nguyễn Văn A",
    course: "Lập Trình Web",
    avatarUrl: "https://placehold.co/60x60/6366f1/FFFFFF?text=AVT",
  },
  {
    quote:
      '"Nội dung khóa học marketing số rất chi tiết và dễ hiểu. Tôi đã áp dụng được ngay vào công việc và thấy hiệu quả rõ rệt."',
    author: "Trần Thị B",
    course: "Marketing Số",
    avatarUrl: "https://placehold.co/60x60/8b5cf6/FFFFFF?text=AVT",
  },
];

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [courses, setCourses] = useState<Course[] | []>([]);
  const [suggestionCourse, setSuggestionCourse] = useState<Course[]>([]);
  const [success, setSuccess] = useState(false);
  const { refreshCartCount } = useCart();
  const imageCourse = "http://localhost:5000/uploads/";
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      easing: "ease-out-cubic",
    });

    AOS.refresh();
  }, []);

  const GetSuggestionCourse = async () => {
    const res = await fetch("http://localhost:5000/api/suggestion", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    setSuggestionCourse(data.message);
  };

  useEffect(() => {
    const fetchCourses = async () => {
      const data = await GetCourse();
      setCourses(data);
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    GetSuggestionCourse();
  }, []);

  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = (): void => {
    setIsMobileMenuOpen(false);
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

  return (
    <div className="d-flex flex-column min-vh-100">
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap');
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8fafc;
            color: #334155;
        }
        .hero-section-bg {
            position: relative;
            overflow: hidden;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); /* Apply gradient directly here */
        }
        .hero-section-bg::before {
            content: '';
            position: absolute;
            top: -50px;
            left: -50px;
            width: 200px;
            height: 200px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            animation: moveCircle1 15s infinite alternate;
        }
        .hero-section-bg::after {
            content: '';
            position: absolute;
            bottom: -50px;
            right: -50px;
            width: 150px;
            height: 150px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 50%;
            animation: moveCircle2 12s infinite alternate;
        }
        @keyframes moveCircle1 {
            0% { transform: translate(0, 0); }
            50% { transform: translate(50px, 50px); }
            100% { transform: translate(0, 0); }
        }
        @keyframes moveCircle2 {
            0% { transform: translate(0, 0); }
            50% { transform: translate(-40px, -40px); }
            100% { transform: translate(0, 0); }
        }

        .course-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .course-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        .testimonial-card {
            background-color: white;
            border-radius: 1rem;
            padding: 2rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            transition: transform 0.3s ease;
        }
        .testimonial-card:hover {
            transform: scale(1.02);
        }

        .btn-primary-custom {
            background-color: #f97316;
            color: white;
            padding: 0.75rem 2rem;
            border-radius: 9999px;
            font-weight: 600;
            transition: background-color 0.3s ease, transform 0.2s ease;
            border: none;
        }
        .btn-primary-custom:hover {
            background-color: #ea580c;
            transform: translateY(-2px);
        }
        .btn-secondary-custom {
            background-color: transparent;
            color: white;
            border: 2px solid white;
            padding: 0.75rem 2rem;
            border-radius: 9999px;
            font-weight: 600;
            transition: background-color 0.3s ease, color 0.3s ease;
        }
        .btn-secondary-custom:hover {
            background-color: white;
            color: #6366f1;
        }

        .why-us-card {
            background: white;
            border-radius: 1.5rem;
            padding: 2.5rem;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            border: 1px solid #e2e8f0;
        }
        .why-us-card:hover {
            transform: translateY(-8px) scale(1.01);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
        }
        .why-us-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 6px;
            background: linear-gradient(90deg, #6366f1, #8b5cf6);
            transition: height 0.3s ease;
        }
        .why-us-card:hover::before {
            height: 10px;
        }
        .why-us-icon {
            font-size: 4rem;
            margin-bottom: 1.5rem;
            display: inline-block;
            background: linear-gradient(45deg, #6366f1, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            /* Animation applied by AOS, no need for custom keyframe here */
        }

        /* Swiper Customizations (Adjusted for Bootstrap compatibility) */
        .swiper-button-prev, .swiper-button-next {
            width: 50px !important;
            height: 50px !important;
            background-color: rgba(255, 255, 255, 0.6) !important;
            border-radius: 50% !important;
            color: #334155 !important;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1) !important;
            transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
        }
        .swiper-button-prev:hover, .swiper-button-next:hover {
            background-color: rgba(255, 255, 255, 0.8) !important;
            transform: translateY(-50%) scale(1.05) !important;
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2) !important;
        }
        .swiper-button-prev::after, .swiper-button-next::after {
            font-size: 1.5rem !important;
            font-weight: bold !important;
            color: #334155 !important;
        }
        .swiper-button-prev {
            left: 1rem !important;
        }
        .swiper-button-next {
            right: 1rem !important;
        }

        .swiper-pagination-bullet {
            width: 10px !important;
            height: 10px !important;
            background-color: rgba(255, 255, 255, 0.5) !important;
            opacity: 1 !important;
            transition: background-color 0.3s ease, width 0.3s ease, height 0.3s ease !important;
        }
        .swiper-pagination-bullet-active {
            background-color: white !important;
            width: 12px !important;
            height: 12px !important;
        }
        `}
      </style>

      <NavigationMain />

      <section className="position-relative" style={{ height: "580px" }}>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          navigation // Enables prev/next buttons
          pagination={{ clickable: true }} // Enables pagination dots
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={true}
          speed={800}
          className="w-100 h-100 hero-section-bg" // Apply hero-section-bg to Swiper container
        >
          {slides.map((slide, index) => (
            <SwiperSlide
              key={index}
              className="d-flex align-items-center justify-content-center text-center text-white"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${slide.bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div
                className="mx-auto px-4 position-relative z-10"
                style={{ maxWidth: "800px" }}
              >
                <h1 className="display-4 fw-bolder mb-4">{slide.title}</h1>
                <p className="lead mb-5 opacity-90">{slide.desc}</p>
                <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                  <Link
                    href={"/courses"}
                    className="btn-primary-custom text-decoration-none"
                  >
                    {" "}
                    {slide.buttonText}
                  </Link>
                  <Link
                    href={"/about"}
                    className="btn-secondary-custom text-decoration-none"
                  >
                    {" "}
                    {slide.secondaryButtonText}
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
      {/**Recommendation Course */}
      {Array.isArray(suggestionCourse) && suggestionCourse.length > 0 ? (
        <section className={styles.sectionDark}>
          <h2 className={styles.sectionTitle} data-aos="fade-up">
            Khóa học bạn có thể thích
          </h2>
          <div className={styles.courseGrid}>
            {suggestionCourse.map((c, index) => (
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
                  <p>{Number(c.price).toLocaleString("vi-VN")} VND</p>
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
      ) : (
        <></>
      )}

      <section className={styles.sectionDark}>
        <h2 className={styles.sectionTitle} data-aos="fade-up">
          Khóa học nổi bật
        </h2>
        <div className={styles.courseGrid}>
          {courses.slice(0, 3).map((c, index) => (
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
                <p>{Number(c.price).toLocaleString("vi-VN")} VND</p>
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

      {/* Why Choose Us Section */}
      <section className="py-5 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="container text-center">
          <h2 className="mb-5 fw-bolder text-gray-900 fs-2" data-aos="fade-up">
            Tại Sao Chọn <span className="text-indigo-600">CourseBase</span>?
          </h2>
          <div className="row row-cols-1 row-cols-md-3 g-4">
            {whyUsItems.map((item, index) => (
              <div
                key={index}
                className="col"
                data-aos="fade-up"
                data-aos-delay={index * 150}
              >
                <div className="why-us-card h-100">
                  <div className="why-us-icon">{item.icon}</div>
                  <h3 className="fs-4 fw-bold mb-3 text-gray-800">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 lh-base">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-5 bg-white">
        <div className="container">
          <h2
            className="text-center mb-5 fw-bold text-gray-800 fs-2"
            data-aos="fade-up"
          >
            Học Viên Nói Gì Về Chúng Tôi
          </h2>
          <div className="row row-cols-1 row-cols-md-2 g-4">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="col"
                data-aos="fade-up"
                data-aos-delay={index * 150}
              >
                <div className="testimonial-card h-100">
                  <p className="text-gray-700 lh-base mb-4">
                    {testimonial.quote}
                  </p>
                  <div className="d-flex align-items-center">
                    <img
                      src={testimonial.avatarUrl}
                      alt={`Avatar của ${testimonial.author}`}
                      className="rounded-circle me-3"
                      style={{ width: "48px", height: "48px" }}
                    />
                    <div>
                      <p className="fw-semibold text-gray-800 mb-0">
                        {testimonial.author}
                      </p>
                      <p className="small text-gray-500 mb-0">
                        Học viên khóa {testimonial.course}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section
        className="py-5 bg-indigo-700 text-white text-center bg-primary"
        data-aos="fade-up"
      >
        <div className="container">
          <h2 className="mb-4 fw-bold fs-2">
            Sẵn Sàng Bắt Đầu Hành Trình Học Tập Của Bạn?
          </h2>
          <p
            className="lead mb-5 opacity-90 mx-auto"
            style={{ maxWidth: "800px" }}
          >
            Đừng chần chừ nữa! Đăng ký ngay hôm nay để nhận ưu đãi đặc biệt và
            bắt đầu khám phá thế giới tri thức.
          </p>
          <a
            href="#"
            className="btn-primary-custom px-5 py-3 fs-5 text-decoration-none"
            data-aos="zoom-in"
            data-aos-delay="300"
          >
            Đăng Ký Ngay
          </a>
        </div>
      </section>

      {success && <AlertSuccess message="Thêm Giỏ Hàng Thành Công" />}
      <Footer />
    </div>
  );
}
