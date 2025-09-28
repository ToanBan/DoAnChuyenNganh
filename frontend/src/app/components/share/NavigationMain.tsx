"use client";

import React, { useEffect, useState } from "react";
import LoginPartial from "./loginpartial";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ShopCart from "../shopping_cart";
import SearchPage from "../search";
import GetNotifications from "@/app/api/GetNotifications";
import { useCart } from "@/app/context/CartContext";
interface Notification {
  id: string;
  message: string;
  sender: {
    username: string;
    avatar: string;
    id: string;
  };
  type: string;
  receiver: {
    id: string;
  };
}

const NavigationMain = () => {
  const pathName = usePathname();
  const [count, setCount] = useState(0);
  const [notification, setNotification] = useState<Notification[] | null>(null);
  const imgUrl = "http://localhost:5000/uploads/";
  const [imgSrc, setImgSrc] = useState("");
  const { countCartItem } = useCart();
  const [teacherId, setTeacherId] = useState<string | null>(null);


  useEffect(() => {
    //@ts-ignore
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  useEffect(() => {
    const fetchNotification = async () => {
      const data = await GetNotifications();
      if (data?.message && Array.isArray(data.message)) {
        setNotification(data.message);
        setCount(data.count || 0);
      } else {
        setNotification([]);
        setCount(0);
      }
    };
    fetchNotification();
  }, []);

  const handleReadNotifications = async (
    e: React.MouseEvent<HTMLAnchorElement>,
    userId: string,
    type: string,
    notificationID: string
  ) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/read-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ userId, type, notificationID }),
      });

      const data = await res.json();
      if (teacherId) {
        window.location.href = "/teacher/dashboard";
      }
      if (data.message.type === "register_course") {
        window.location.href = "/admin/confirmation_course";
      } else {
        window.location.href = "/admin/teacher_requests";
      }
    } catch (err) {
      console.error("Lỗi khi đánh dấu thông báo:", err);
    }
  };

  useEffect(() => {
    const id = localStorage.getItem("teacherId");
    setTeacherId(id);
  }, []);



  return (
    <>
      <style jsx>{`
        .dropdown-menu {
          min-width: 250px;
          border-radius: 12px;
          animation: fadeIn 0.3s ease-in-out;
        }

        .dropdown-item {
          border-radius: 8px;
          transition: background-color 0.2s ease-in-out;
        }

        .dropdown-item:hover {
          background-color: #f0f0f0;
        }

        .dropdown-toggle::after {
          display: none;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <nav
        className="navbar navbar-expand-lg navbar-light"
        style={{ position: "relative" }}
      >
        <div className="container-fluid">
          <Image
            alt="logo-main"
            width={50}
            height={50}
            src={
              "data:image/png;base64,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"
            }
          ></Image>
          <Link
            style={{
              fontWeight: "800",
              fontStyle: "italic",
              color: "cadetblue",
            }}
            href={"/"}
            className="navbar-brand"
          >
            CourseBase
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li
                className={`nav-item ${
                  pathName === "/courses" ? "activeNavigation" : ""
                }`}
              >
                <Link className="nav-link " href={"/courses"}>
                  KHÓA HỌC
                </Link>
              </li>

              <li
                className={`nav-item ${
                  pathName === "/about" ? "activeNavigation" : ""
                }`}
              >
                <Link className="nav-link" href={"/about"}>
                  GIỚI THIỆU
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href={"/verify_certificate"}>
                  KIỂM TRA CHỨNG NHẬN
                </Link>
              </li>
            </ul>
            <span className="navbar-text d-flex">
              <button
                type="button"
                className="nav-link me-3"
                data-bs-toggle="offcanvas"
                data-bs-target="#cart"
              >
                CART ({countCartItem})
              </button>

              <a
                href="#"
                className="nav-link"
                data-bs-toggle="modal"
                data-bs-target="#searchModal"
              >
                <span className="search-icon">
                  <Image
                    src={
                      "https://cdn-icons-png.flaticon.com/128/2811/2811806.png"
                    }
                    alt="search"
                    width={28}
                    height={28}
                  ></Image>
                </span>
              </a>

              <div className="dropdown">
                <a
                  className="ms-3 me-2 nav-link dropdown-toggle position-relative"
                  href="#"
                  id="notificationDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <Image
                    alt="notification"
                    width={28}
                    height={28}
                    src={
                      "data:image/png;base64,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"
                    }
                  />
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {count}
                    <span className="visually-hidden">
                      unread notifications
                    </span>
                  </span>
                </a>

                <ul
                  className="dropdown-menu dropdown-menu-end shadow-lg p-2"
                  aria-labelledby="notificationDropdown"
                >
                  {notification && notification.length > 0 ? (
                    notification.map((note) => (
                      <li key={note.id}>
                        <Link
                          onClick={(e) =>
                            handleReadNotifications(
                              e,
                              note.receiver.id,
                              note.type,
                              note.id
                            )
                          }
                          className="dropdown-item d-flex align-items-center"
                          href="#"
                        >
                          <Image
                            style={{
                              width: "30px",
                              height: "30px",
                              objectFit: "cover",
                            }}
                            className="img-fluid rounded-circle mb-4 border border-3 border-info shadow-sm me-2"
                            src={
                              note.sender.avatar
                                ? `${imgUrl}${note.sender.avatar}`
                                : "https://www.lewesac.co.uk/wp-content/uploads/2017/12/default-avatar.jpg"
                            }
                            width={30}
                            height={30}
                            alt={`${note.sender.username}`}
                            onError={() =>
                              setImgSrc(
                                "https://www.lewesac.co.uk/wp-content/uploads/2017/12/default-avatar.jpg"
                              )
                            }
                          />
                          <div>
                            <div className="fw-bold">
                              {note.sender.username}
                            </div>
                            <div className="text-muted small">
                              {note.message}
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))
                  ) : (
                    <p>Chưa Có Thông Báo Nào</p>
                  )}
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <a
                      className="dropdown-item text-center text-muted small"
                      href="#"
                    >
                      Xem tất cả thông báo
                    </a>
                  </li>
                </ul>
              </div>

              <LoginPartial />
            </span>
          </div>
        </div>
      </nav>

      <SearchPage />
      <ShopCart />
    </>
  );
};

export default NavigationMain;
