'use client'

import React, { useEffect } from "react";

const ResetPasswordPage = () => {
  
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      const res = await fetch('http://localhost:5000/api/reset-password', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })
      const data = await res.json();
      console.log(data);
  }

  const checkStep = async () => {
        const res = await fetch('http://localhost:5000/api/check-step'); // gọi Express API
        const data = await res.json();
  
        if (data.message !== 'verified') {
          window.location.href = "/forgot"
        }
      };
    
  useEffect(()=> {
    checkStep();
  }, [])


  return (
    <>
      <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: "#fefae0" }}>
        <div className="reset-container">
          <h2>Reset Password</h2>
          <p className="text-muted">
            Enter your new password at 03:29 PM +07 on Thursday, June 26, 2025.
          </p>
          <form onSubmit={handleResetPassword}>
            <div className="form-group mb-4">
              <label>New Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                placeholder="Enter new password"
                required
              />
            </div>
            <div className="form-group mb-5">
              <label>Confirm Password</label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm new password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Reset Password
            </button>
          </form>
          <p className="text-muted mt-3">
            Back to <a href="#">Login</a>
          </p>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
