"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AlertError from "@/app/components/share/alert_error";
import { set } from "zod/v4";
const LoginPage = () => {
  const [error, setError] = useState(false);
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    if (res.status === 200) {
      const data = await res.json();
      const role = data.message;
      localStorage.setItem("token", data.token);
      if (role === "admin") {
        window.location.href = "/admin/dashboard";
      } else if (role === "teacher") {
        window.location.href = "/teacher/dashboard";
      } else {
        window.location.href = "/"; 
      }
    } else {
      setError(true);
      window.setTimeout(() => {
        setError(false);
      }, 4000);
    }
  };

  const handleRedirectGoogle = async () => {
    const res = await fetch("http://localhost:5000/api/google", {
      method: "GET",
      credentials: "include",
    });
    if (res.status !== 200) {
      console.error("không thể di chuyển đến google");
    }
    const data = await res.json();
    window.location.href = data.message;
  };

  return (
    <div
      className="container-fluid min-vh-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: "cornsilk" }}
    >
      <div
        className="row h-100 g-0"
        style={{
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          width: "1200px",
        }}
      >
        {/* Left image */}
        <div className="d-none d-md-flex col-md-6 bg-light align-items-center justify-content-center">
          <Image
            src="https://img.freepik.com/free-vector/welcome-lettering-design_23-2147914748.jpg?ga=GA1.1.262810338.1745506426&semt=ais_hybrid&w=740"
            alt="login image"
            width={500}
            height={500}
            style={{ height: "625px", objectFit: "cover", width: "600px" }}
            className="rounded-start"
            priority
          />
        </div>

        {/* Right form */}
        <div
          className="col-md-6 d-flex align-items-center justify-content-center bg-white"
          style={{ padding: "40px" }}
        >
          <div
            className="w-100 px-4"
            style={{ maxWidth: "400px", width: "478px" }}
          >
            <h2 className="text-center fw-bold mb-4">Welcome Back 👋</h2>
            {error && <AlertError message="Đăng Nhập Không Thành Công"/>}
            <form onSubmit={handleLogin}>
              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  placeholder="Email của bạn"
                  required
                />
                <label htmlFor="email">Email address</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  placeholder="Mật khẩu"
                  required
                />
                <label htmlFor="password">Password</label>
              </div>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="rememberPasswordCheck"
                />
                <label
                  className="form-check-label"
                  htmlFor="rememberPasswordCheck"
                >
                  Remember me
                </label>
              </div>

              <div className="d-grid mb-3">
                <button
                  className="btn btn-primary btn-lg text-uppercase fw-bold"
                  type="submit"
                >
                  Sign in
                </button>
              </div>

              {/* OR with lines */}
              <div className="d-flex align-items-center my-4">
                <div className="flex-grow-1 border-top"></div>
                <span className="mx-2 text-muted">or</span>
                <div className="flex-grow-1 border-top"></div>
              </div>

              {/* Google Sign In */}
              <div className="d-grid mb-4">
                <button
                  onClick={handleRedirectGoogle}
                  type="button"
                  className="btn btn-outline-danger btn-lg d-flex align-items-center justify-content-center gap-2"
                >
                  <Image
                    src="https://cdn-icons-png.flaticon.com/128/300/300221.png"
                    alt="Google icon"
                    width={20}
                    height={20}
                  />
                  Sign in with Google
                </button>
              </div>

              <div className="text-center mt-4">
                <p className="mb-1">
                  Don’t have an account?{" "}
                  <Link href="/register" className="text-decoration-none">
                    Register Here
                  </Link>
                </p>
                <p>
                  <Link href="/forgot" className="text-decoration-none">
                    Forgot password?
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
