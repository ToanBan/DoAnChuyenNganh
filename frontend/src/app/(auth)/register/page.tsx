'use client'

import React, { use, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import AlertSuccess from '@/app/components/share/alert_success'
import AlertError from '@/app/components/share/alert_error'
import {registerSchema} from '../../../../lib/validation/registerSchema'

const RegisterPage = ({message}:{message:string}) => {
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false);
  const [validationError, setValidationError] =  useState<Record<string, string>>({});
  const handleRegister = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      cfnpassword: formData.get('cfnpassword') as string
    }

    const result = registerSchema.safeParse(data)
    if (!result.success) {
      const formatted = result.error.format();
      console.log("Lỗi định dạng:", formatted);
      const fieldErrors: Record<string, string> = {};

      for (const key in formatted) {
        if (key !== "_errors") {
          const field = formatted[key as keyof typeof formatted];
          if (field && "_errors" in field && field._errors.length > 0) {
            fieldErrors[key] = field._errors[0]; 
          }
        }
      }

      console.log("Lỗi theo trường:", fieldErrors);
      setValidationError(fieldErrors);
      return;
    }

    const res = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      body: formData,
     
    })
    if (res.status === 200) {
      setSuccess(true)
      setTimeout(()=>{
        setSuccess(false)
      }, 4000);
    } else {
      
      setError(true)
      setTimeout(()=>{
        setError(false)
      }, 4000);
    }
  }


  return (
    <>
      <div
      className="container-fluid min-vh-100 d-flex align-items-center justify-content-center position-relative"
      style={{ backgroundColor: '#fefae0' }}
    >
      <div
        className="row w-100 h-75 g-0 overflow-hidden shadow"
        style={{ borderRadius: '12px', maxWidth: '1100px' }}
      >
        {/* Left Image */}
        <div className="d-none d-md-block col-md-6 position-relative p-0">
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Image
              src="https://img.freepik.com/premium-vector/handsome-boy-saying-hello-comic-bubble-speech_33070-5613.jpg?ga=GA1.1.262810338.1745506426&semt=ais_hybrid&w=740"
              alt="register-image"
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-start"
              priority
            />
          </div>
        </div>

        {/* Right Form */}
        <div className="col-md-6 d-flex align-items-center justify-content-center bg-white" style={{padding:"40px"}}>
          <div className="w-100 px-4" style={{ maxWidth: '400px' }}>
            <h2 className="text-center fw-bold mb-4">Create Your Account</h2>
            {success && (<AlertSuccess message='Đăng Ký Thành Công'/>)}
            {error && <AlertError message='Đăng Ký Không Thành Công'/>}
            <form onSubmit={handleRegister}>
              {/* Full Name */}
              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  name="username"
                  placeholder="Tên của bạn"
                  required
                />
                <label htmlFor="username">Tên của bạn</label>
                {validationError.username && <div className="text-danger mt-1">{validationError.username}</div>}
              </div>

              {/* Email */}
              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  placeholder="Email của bạn"
                  required
                />
                <label htmlFor="email">Email của bạn</label>
                {validationError.email && <div className="text-danger mt-1">{validationError.email}</div>}
              </div>

              {/* Password */}
              <div className="form-floating mb-3">
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  placeholder="Mật khẩu"
                  required
                />
                <label htmlFor="password">Mật khẩu</label>
                {validationError.password && <div className="text-danger mt-1">{validationError.password}</div>}
              </div>

              {/* Confirm Password */}
              <div className="form-floating mb-4">
                <input
                  type="password"
                  className="form-control"
                  id="cfnpassword"
                  name="cfnpassword"
                  placeholder="Nhập lại mật khẩu"
                  required
                />
                <label htmlFor="cfnpassword">Nhập lại mật khẩu</label>
                {validationError.cfnpassword && <div className="text-danger mt-1">{validationError.cfnpassword}</div>}
              </div>

              {/* Submit */}
              <div className="d-grid mb-3">
                <button
                  className="btn btn-primary btn-lg text-uppercase fw-bold"
                  type="submit"
                >
                  Sign Up
                </button>
              </div>

              {/* Login Link */}
              <div className="text-center">
                <p className="mb-0">
                  Already have an account?{' '}
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
   
    </>

    
  )
}

export default RegisterPage
