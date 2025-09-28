"use client";
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useSearchParams } from 'next/navigation';

interface Certificate {
  id: string;
  uid: string;
  course: {
    course_name: string;
  };
  teacher: {
    name: string;
  };
  user: {
    username: string;
  };
  generated_at: string;
}

const VerifyCertificate = () => {
  const [certificate, setCertificate] = useState<Certificate | "">("");
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid');

  // 🔁 Tự động fetch khi có UID trên URL (QR code scan)
  useEffect(() => {
    if (uid) {
      const formData = new FormData();
      formData.append("uid", uid);

      fetch("http://localhost:5000/api/verify_certificate", {
        method: "POST",
        body: formData,
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => setCertificate(data.message));
    }
  }, [uid]);

  // 🔍 Tìm kiếm khi người dùng nhập UID
  const handleSearchUid = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const res = await fetch("http://localhost:5000/api/verify_certificate", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const data = await res.json();
    setCertificate(data.message);
  };

  return (
    <>
      <style>
        {`
        .search-container {
          background-color: #ffffff;
          padding: 40px;
          border-radius: 15px; 
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          max-width: 800px;
          width: 100%;
          text-align: center;
        }
        .search-input-group {
          margin-bottom: 30px;
        }
        .search-input {
          border-radius: 50px; 
          padding: 15px 25px;
          border: 1px solid #ced4da;
          transition: all 0.3s ease; 
        }
        .search-input:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 0.25rem rgba(0, 123, 255, 0.25); 
        }
        .search-button {
          border-radius: 50px; 
          padding: 15px 30px;
          background-color: #007bff; 
          border-color: #007bff;
          transition: all 0.3s ease;
        }
        .search-button:hover {
          background-color: #0056b3;
          border-color: #004085;
          transform: translateY(-2px); 
        }
        .certificate-card {
          background-color: #f8f9fa; 
          border-radius: 10px;
          padding: 30px;
          text-align: left;
          border: 1px solid #e9ecef;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05); 
          margin-top: 30px;
          opacity: 0; 
          transform: translateY(20px);
          animation: fadeInSlideUp 0.8s forwards; 
        }

        @keyframes fadeInSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .certificate-header {
          border-bottom: 1px solid #dee2e6;
          padding-bottom: 15px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .certificate-header h4 {
          margin: 0;
          color: #343a40;
        }
        .certificate-info p {
          margin-bottom: 10px;
          color: #495057;
        }
        .certificate-info strong {
          color: #212529;
        }
        .certificate-status {
          font-weight: bold;
          padding: 5px 15px;
          border-radius: 20px;
          display: inline-block;
        }
        .status-valid {
          background-color: #d4edda;
          color: #155724;
        }
        .status-expired {
          background-color: #f8d7da;
          color: #721c24;
        }
        .status-revoked {
          background-color: #ffeeba;
          color: #856404;
        }
        .certificate-icon {
          color: #28a745;
          margin-right: 10px;
        }

        @media (max-width: 768px) {
          .search-container {
            padding: 25px;
            margin: 20px;
          }
          .search-input-group .btn {
            width: 100%;
            margin-top: 15px;
          }
          .certificate-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .certificate-status {
            margin-top: 10px;
          }
        }
      `}
      </style>

      <div className="container d-flex justify-content-center">
        <div className="search-container">
          <h2 className="mb-4 fw-bold text-primary">Xác thực Chứng chỉ</h2>
          <p className="text-muted mb-5">
            Nhập mã UID của chứng chỉ để kiểm tra thông tin.
          </p>

          <form onSubmit={handleSearchUid}>
            <div className="input-group search-input-group">
              <input
                type="text"
                className="form-control search-input"
                placeholder="Nhập UID chứng chỉ của bạn..."
                aria-label="uid"
                name="uid"
              />
              <button className="btn search-button" type="submit">
                <Search className="me-2" size={25} />
              </button>
            </div>
          </form>

          {!certificate || certificate === null ? (
            <p className="text-secondary mt-4">Nhập UID để tìm kiếm chứng chỉ</p>
          ) : certificate.user && certificate.course && certificate.teacher ? (
            <div className="certificate-card" id="simulatedCertificate">
              <div className="certificate-header">
                <h4>
                  <i className="fas fa-certificate certificate-icon"></i> Thông tin Chứng chỉ
                </h4>
                <span className="certificate-status status-valid">Hợp lệ</span>
              </div>
              <div className="certificate-info">
                <p>
                  <strong>Mã UID:</strong>{" "}
                  <span className="text-primary">{certificate.uid}</span>
                </p>
                <p>
                  <strong>Người sở hữu:</strong> {certificate.user.username}
                </p>
                <p>
                  <strong>Khóa Học Của:</strong> {certificate.teacher.name}
                </p>
                <p>
                  <strong>Tên chứng chỉ:</strong> Chứng chỉ Hoàn thành Khóa học{" "}
                  {certificate.course.course_name}
                </p>
                <p>
                  <strong>Tổ chức cấp:</strong> CourseBase
                </p>
                <p>
                  <strong>Ngày cấp:</strong>{" "}
                  {new Date(certificate.generated_at).toLocaleDateString("vi-VN")}
                </p>
                <p>
                  <strong>Mô tả:</strong> Chứng chỉ này xác nhận{" "}
                  {certificate.user.username} đã hoàn thành xuất sắc khóa{" "}
                  {certificate.course.course_name}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-danger fw-semibold mt-4">Không tìm thấy chứng chỉ</p>
          )}
        </div>
      </div>
    </>
  );
};

export default VerifyCertificate;
