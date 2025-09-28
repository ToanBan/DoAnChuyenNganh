"use client";
import React, { useState, useEffect } from "react";
import CourseRevenueChart from "@/app/components/share/CourseRevenueChart";
import CoursesSoldChart from "@/app/components/share/CoursesSoldChart";
import NavigationAdmin_Teacher from "@/app/components/share/NavigationAdmin";
import Link from "next/link";
import {
  BookOpenCheck,
  GraduationCap,
  DollarSign,
  CheckCircle2,
  Clock4,
  XCircle,
} from "lucide-react";
interface MonthlyRevenue {
  month: number;
  monthlyRevenue: string;
}

interface MonthlySold {
  month: number;
  totalSold: string;
}

export default function TeacherDashboard() {
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalSoldResult, setTotalSoldResult] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [monthlySold, setMonthlySold] = useState<MonthlySold[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseRejected, setCourseRejected] = useState(0);
  const [courseAccepted, setCourseAccepted] = useState(0);
  const [coursePending, setCoursePending] = useState(0);
  useEffect(() => {
    fetch("http://localhost:5000/api/teacher_dashboard", {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        setTotalCourses(data.teacher_courses || 0);
        setTotalSoldResult(data.totalSoldResult?.totalSold || 0);
        setTotalRevenue(parseFloat(data.totalRevenue) || 0);
        setCourseRejected(data.course_rejected);
        setCourseAccepted(data.course_accepted);
        setCoursePending(data.course_pending);
        setMonthlyRevenue(
          Array.isArray(data.revenueByMonth) ? data.revenueByMonth : []
        );
        setMonthlySold(
          Array.isArray(data.monthlySales) ? data.monthlySales : []
        );
      })
      .catch((err) => console.error("Lỗi khi fetch teacher overview:", err))
      .finally(() => setLoading(false));
  }, []);

  const revenueChartData = monthlyRevenue.map((d) => ({
    month: `Tháng ${d.month}`,
    revenue: parseFloat(d.monthlyRevenue),
  }));
  const soldChartData = monthlySold.map((d) => ({
    month: `Tháng ${d.month}`,
    sold: parseInt(d?.totalSold, 10),
  }));

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p>Đang tải dữ liệu…</p>
      </div>
    );
  }

  return (
    <>
      <NavigationAdmin_Teacher />
      <div className="content">
        <div className="container py-4">
          <h2 className="text-center mb-5 fw-bold">
            📊 Dashboard <span className="text-primary">Giáo Viên</span>
          </h2>

          <div className="row g-4 mb-4">
            <Link
              className="col-md-4 text-decoration-none"
              href={"/teacher/courses"}
            >
              <div>
                <div className="card shadow-sm border-0 text-center p-4 h-100 d-flex justify-content-center align-items-center">
                  <BookOpenCheck size={40} className="text-primary mb-2" />
                  <h3 className="fw-bold">{totalCourses}</h3>
                  <p className="text-muted mb-0">Khóa học đã đăng</p>
                </div>
              </div>
            </Link>

            <Link
              className="col-md-4 text-decoration-none"
              href={"/teacher/course_sold"}
            >
              <div>
                <div className="card shadow-sm border-0 text-center p-4 h-100 d-flex justify-content-center align-items-center">
                  <GraduationCap size={40} className="text-success mb-2" />
                  <h3 className="fw-bold">{totalSoldResult}</h3>
                  <p className="text-muted mb-0">Số lượng khóa học được bán</p>
                </div>
              </div>
            </Link>

            <div className="col-md-4">
              <div className="card shadow-sm border-0 text-center p-4 h-100 d-flex justify-content-center align-items-center">
                <DollarSign size={40} className="text-warning mb-2" />
                <h3 className="fw-bold">
                  {totalRevenue.toLocaleString("vi-VN")} đ
                </h3>
                <p className="text-muted mb-0">Tổng doanh thu</p>
              </div>
            </div>

            <Link
              className="col-md-4 text-decoration-none"
              href={"/teacher/course_accept"}
            >
              <div>
                <div className="card shadow-sm border-0 text-center p-4 h-100 d-flex justify-content-center align-items-center">
                  <CheckCircle2 size={40} className="text-success mb-2" />
                  <h3 className="fw-bold">{courseAccepted}</h3>
                  <p className="text-muted mb-0">Khóa học được phê duyệt</p>
                </div>
              </div>
            </Link>

            <Link
              className="col-md-4 text-decoration-none"
              href={"/teacher/course_pending"}
            >
              <div>
                <div className="card shadow-sm border-0 text-center p-4 h-100 d-flex justify-content-center align-items-center">
                  <Clock4 size={40} className="text-info mb-2" />
                  <h3 className="fw-bold">{coursePending}</h3>
                  <p className="text-muted mb-0">Khóa học đang chờ xử lý</p>
                </div>
              </div>
            </Link>

            {/* Khóa học bị từ chối */}
            <Link className="col-md-4 text-decoration-none" href={"/teacher/course_reject"}>
              <div>
                <div className="card shadow-sm border-0 text-center p-4 h-100 d-flex justify-content-center align-items-center d-flex justify-content-center align-items-center">
                  <XCircle size={40} className="text-danger mb-2" />
                  <h3 className="fw-bold">{courseRejected}</h3>
                  <p className="text-muted mb-0">Khóa học bị từ chối</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="row g-4">
            <div className="col-md-6">
              <div className="card shadow-sm p-3">
                <h5 className="mb-3 text-primary">📈 Doanh thu theo tháng</h5>
                <CourseRevenueChart data={revenueChartData} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="card shadow-sm p-3">
                <h5 className="mb-3 text-success">
                  📊 Số khóa đã bán theo tháng
                </h5>
                <CoursesSoldChart data={soldChartData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
