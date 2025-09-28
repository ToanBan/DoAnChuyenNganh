"use client";
import React, { useEffect, useRef, useState } from "react";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LoginPartial from "./loginpartial";
import Image from "next/image";
import Link from "next/link";
import GetNotifications from "@/app/api/GetNotifications";
interface Notification {
  id: string;
  message: string;
  sender: {
    username: string;
    avatar: string;
    id: string;
  };
  type: string;
}

const Notifications = () => {
  const userMenuRef = useRef(null);
  const notificationBellRef = useRef(null);
  const [count, setCount] = useState(0);
  const [notification, setNotification] = useState<Notification[] | null>(null);
  const [imgSrc, setImgSrc] = useState("");
  const imgUrl = "http://localhost:5000/uploads/";
  const [teacherId, setTeacherId] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotification = async () => {
      const data = await GetNotifications();
      setNotification(data.message);
      setCount(data.count);
    };
    fetchNotification();
    // const interval = setInterval(fetchNotification, 60000);
    // return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const id = localStorage.getItem("teacherId");
    setTeacherId(id);
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

  return (
    <>
      <div className="dropdown hover-dropdown" ref={notificationBellRef}>
        <button
          className="btn btn-link text-white position-relative p-2 rounded-circle notification-button"
          type="button"
          id="notificationDropdown"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          aria-haspopup="true"
        >
          <FontAwesomeIcon icon={faBell} className="fs-4" />

          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light">
            {count}
            <span className="visually-hidden">unread messages</span>
          </span>
        </button>

        <ul
          className="dropdown-menu dropdown-menu-end shadow-lg rounded-lg overflow-hidden notification-dropdown-menu"
          aria-labelledby="notificationDropdown"
        >
          <li>
            <h6 className="dropdown-header">Thông báo mới</h6>
          </li>

          {notification && notification.length > 0 ? (
            notification.map((note, index) => (
              <li key={note.id || index}>
                <Link
                  onClick={(e) =>
                    handleReadNotifications(
                      e,
                      note.sender.id,
                      note.type,
                      note.id
                    )
                  }
                  href="#"
                  className="dropdown-item d-flex align-items-center py-2 px-3 text-dark"
                >
                  <div className="flex-shrink-0 me-3">
                    <Image
                      style={{
                        width: "30px",
                        height: "30px",
                        objectFit: "cover",
                      }}
                      className="img-fluid rounded-circle mb-4 border border-3 border-info shadow-sm"
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
                  </div>
                  <div>
                    <div className="fw-semibold">{note.type}</div>
                    <div className="text-muted small">{note.message}</div>
                    <div className="text-muted small">
                      {/* {new Date(note.createdAt).toLocaleString("vi-VN")} */}
                    </div>
                  </div>
                </Link>
              </li>
            ))
          ) : (
            <li className="dropdown-item text-muted small">
              Chưa có thông báo mới
            </li>
          )}

          <li>
            <hr className="dropdown-divider" />
          </li>
          <li>
            <a href="#" className="dropdown-item text-center text-primary">
              Xem tất cả thông báo
            </a>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Notifications;
