'use client';

import React, { useEffect } from "react";

const VerifyPage = () => {
  const [otp, setOtp] = React.useState<string[]>(Array(6).fill(""));

  const handleVerifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const otpValue = otp.join(""); 

    const res = await fetch("http://localhost:5000/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp: otpValue }),
      credentials: "include",
    });

    const data = await res.json();
    if (res.status !== 200) {
      console.error(data.message);
      return;
    }
    if(res.status === 200) {
      window.location.href = "/resetpassword";
    }
  };

  const SaveOTP = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  };

  const checkStep = async () => {
      const res = await fetch('http://localhost:5000/api/check-step'); // gọi Express API
      const data = await res.json();

      if (data.message !== 'forgot') {
        window.location.href = "/forgot"
      }
    };
  
  useEffect(()=> {
    checkStep();
  }, [])
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: "#fefae0" }}>
      <div className="otp-container">
        <h2>Reset Your OTP</h2>
        <p>Please enter the 6-digit OTP sent to your email</p>
        <form onSubmit={handleVerifyOTP}>
          <div className="input-group mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                className="otp-input"
                maxLength={1}
                value={digit}
                onChange={(e) => SaveOTP(index, e.target.value)}
                required
              />
            ))}
          </div>
          <button type="submit" className="btn btn-primary w-100">Verify OTP</button>
        </form>
        <p className="mt-3">Didn't receive the OTP? <a href="#">Resend OTP</a></p>
      </div>
    </div>
  );
};

export default VerifyPage;
