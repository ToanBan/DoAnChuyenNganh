"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import api from "../../../../lib/api/axios";
import Image from "next/image";
import Link from "next/link";
import {
  faChalkboardTeacher,
  faUser,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";

const LoginPartial = () => {
  const [user, setUser] = useState<{ message: { username: string, role:string} } | null>(
    null
  );
  const [teacherId, setTeacherId] = useState("");
  const GetAuthUser = async () => {
    try {
      const res = await api.get("http://localhost:5000/api/user", {
        withCredentials: true,
      });
      const data = res.data;
      if (res.status === 200) {
        setUser(data);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      return;
    }
  };

  const GetTeacherById = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/teacherById", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok && data.message && data.message.id) {
        setTeacherId(data.message.id);
        localStorage.setItem("teacherId", data.message.id);
      } else {
        setTeacherId("");
        localStorage.removeItem("teacherId");
      }
    } catch (error) {
      console.error("Error fetching teacher by ID:", error);
    }
  };



  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (res.ok) {
        window.location.href = "/login";
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await GetAuthUser();
      await GetTeacherById();
    };
    fetchData();
  }, []);

  return (
    <>
      {user ? (
        <div className="dropdown user-dropdown me-3">
          <span style={{ cursor: "pointer" }} className="dropdown-toggle">
            {user.message.username}
          </span>
          <ul className="dropdown-menu" style={{position:"absolute", left:"-80px"}}>
            <li>
              <Link className="dropdown-item" href={"/profile"}>
                <FontAwesomeIcon icon={faUser} className="me-3 text-info" /> Hồ
                sơ Profile
              </Link>
            </li>

            { user.message.role === "teacher" && (
              <li>
                <Link className="dropdown-item" href={"/teacher/courses"}>
                  <FontAwesomeIcon
                    icon={faChalkboardTeacher}
                    className="me-3 text-primary"
                  />
                  Giáo Viên
                </Link>
              </li>
            )}

            <li>
              <button
                className="dropdown-item text-danger"
                onClick={handleLogout}
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="me-3" />
                Logout
              </button>
            </li>
          </ul>
        </div>
      ) : (
        <Link
          className="d-flex align-items-center ms-3 text-decoration-none"
          href={"/login"}
        >
          <Image
            src={"https://cdn-icons-png.flaticon.com/128/15494/15494722.png"}
            width={28}
            height={28}
            alt="login"
          ></Image>
          <p className="m-0">Tài khoản</p>
        </Link>
      )}
    </>
  );
};

export default LoginPartial;
