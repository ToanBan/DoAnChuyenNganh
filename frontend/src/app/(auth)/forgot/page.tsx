'use client'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const ForgotPage = () => {

  const handleForgotPassword = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/forgot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: e.currentTarget.email.value,
      }),
      credentials: 'include',
    });

    if(res.status !== 200){
      console.error('Failed to send reset password email');
      return;
    }
    const data = await res.json();
    window.location.href = '/verify';
    
  }

  return (
    <div
      className="container-fluid min-vh-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: '#fefae0' }}
    >
      <div
        className="row w-100 h-75 g-0 overflow-hidden shadow"
        style={{ borderRadius: '12px', maxWidth: '1000px' }}
      >
        {/* Left Image */}
        <div className="d-none d-md-block col-md-6 position-relative p-0">
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Image
              src="https://img.freepik.com/free-vector/flat-illustration-person-shrugging_23-2149335160.jpg?ga=GA1.1.262810338.1745506426&semt=ais_hybrid&w=740"
              alt="forgot password image"
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-start"
              priority
            />
          </div>
        </div>

        {/* Right form */}
        <div className="col-md-6 d-flex align-items-center justify-content-center bg-white" style={{padding: '3rem'}}>
          <div className="w-100 px-4" style={{ maxWidth: '400px' }}>
            <h2 className="text-center fw-bold mb-3">Forgot Your Password? 🔐</h2>
            <p className="text-center text-muted mb-4">
              Enter your email address and we’ll send you a link to reset your password.
            </p>

            <form onSubmit={handleForgotPassword}>
              <div className="form-floating mb-4">
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

              <div className="d-grid mb-3">
                <button
                  className="btn btn-primary btn-lg text-uppercase fw-bold"
                  type="submit"
                >
                  Reset Password
                </button>
              </div>

              <div className="text-center mt-3">
                <p className="mb-0">
                  Remember your password?{' '}
                  <Link href="/login" className="text-decoration-none fw-semibold">
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPage
