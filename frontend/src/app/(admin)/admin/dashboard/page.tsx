"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import CourseRevenueChart from "@/app/components/share/CourseRevenueChart";
import CoursesSoldChart from "@/app/components/share/CoursesSoldChart";
import { CheckCircle, XCircle, Clock, Users, ShoppingCart } from "lucide-react";

interface MonthlyRevenue {
  month: number;
  total_revenue: string;
}

interface ChartData {
  month: string;
  revenue: number;
}

interface MonthlySold {
  month: number;
  total_sold: string;
}

const coursesSoldData = [
  { month: "Jan", sold: 20 },
  { month: "Feb", sold: 35 },
  { month: "Mar", sold: 25 },
  { month: "Apr", sold: 40 },
];

export default function DashboardPage() {
  const [coursesAccept, setCoursesAccept] = useState(0);
  const [coursesReject, setCoursesReject] = useState(0);
  const [coursesPending, setCoursesPending] = useState(0);
  const [teachersAccept, setTeachersAccept] = useState(0);
  const [boughtCourses, setBoughtCourses] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [monthlySold, setMonthlySold] = useState<MonthlySold[]>([]);
  const GetStatistic = async () => {
    const res = await fetch("http://localhost:5000/api/admin/overview", {
      method: "GET",
      credentials: "include",
    });
    const data = await res.json();
    setCoursesAccept(data.courses_accept);
    setCoursesReject(data.courses_rejected);
    setCoursesPending(data.courses_pending);
    setTeachersAccept(data.teachers_accept);
    setBoughtCourses(data.bougth_courses);
    setMonthlyRevenue(data.monthlyRevenue);
    setMonthlySold(data.monthlySold);
  };

  useEffect(() => {
    GetStatistic();
  }, []);

  const revenueChartData: ChartData[] = monthlyRevenue.map((item) => ({
    month: `Tháng ${item.month}`,
    revenue: parseInt(item.total_revenue),
  }));

  const soldChartData = monthlySold.map((item) => ({
    month: `Tháng ${item.month}`,
    sold: parseInt(item.total_sold),
  }));

  return (
    <>
      <div className="content">
        <h2 className="h2 fw-bolder text-center text-primary mb-4">
          TỔNG QUAN QUẢN TRỊ VIÊN
        </h2>

        <div className="row g-3 mb-4">
          {/* Khóa học đã duyệt */}
          <div className="col-12 col-sm-6 col-lg-4 col-xl-2dot4">
            <Link className="text-decoration-none" href={"/admin/courses"}>
              <div
                className="card shadow-sm rounded-3 p-3 text-center card-approved"
                style={{ backgroundColor: "#d1fae5", color: "#065f46" }}
              >
                <CheckCircle size={36} className="mb-2" />
                <div className="fs-1 fw-bold mb-1">{coursesAccept}</div>
                <div className="fs-5 fw-semibold text-gray-700">
                  Khóa học đã duyệt
                </div>
              </div>
            </Link>
          </div>

          {/* Khóa học bị từ chối */}
          <div className="col-12 col-sm-6 col-lg-4 col-xl-2dot4">
            <Link
              className="text-decoration-none"
              href={"/admin/courses_by_teacher"}
            >
              <div
                className="card shadow-sm rounded-3 p-3 text-center card-rejected"
                style={{ backgroundColor: "#fee2e2", color: "#991b1b" }}
              >
                <XCircle size={36} className="mb-2" />
                <div className="fs-1 fw-bold mb-1">{coursesReject}</div>
                <div className="fs-5 fw-semibold text-gray-700">
                  Khóa học bị từ chối
                </div>
              </div>
            </Link>
          </div>

          {/* Khóa học chờ duyệt */}
          <div className="col-12 col-sm-6 col-lg-4 col-xl-2dot4">
            <Link
              className="text-decoration-none"
              href={"/admin/confirmation_course"}
            >
              <div
                className="card shadow-sm rounded-3 p-3 text-center card-pending"
                style={{ backgroundColor: "#fffbeb", color: "#92400e" }}
              >
                <Clock size={36} className="mb-2" />
                <div className="fs-1 fw-bold mb-1">{coursesPending}</div>
                <div className="fs-5 fw-semibold text-gray-700">
                  Khóa học chờ duyệt
                </div>
              </div>
            </Link>
          </div>

          {/* Tổng số giáo viên */}
          <div className="col-12 col-sm-6 col-lg-4 col-xl-2dot4">
            <Link href={"/admin/teachers"} className="text-decoration-none">
              <div
                className="card shadow-sm rounded-3 p-3 text-center card-teachers"
                style={{ backgroundColor: "#e0e7ff", color: "#3730a3" }}
              >
                <Users size={36} className="mb-2" />
                <div className="fs-1 fw-bold mb-1">{teachersAccept}</div>
                <div className="fs-5 fw-semibold text-gray-700">
                  Tổng số giáo viên
                </div>
              </div>
            </Link>
          </div>

          {/* Học viên đã mua */}
          <div className="col-12 col-sm-6 col-lg-4 col-xl-2dot4">
            <div
              className="card shadow-sm rounded-3 p-3 text-center card-students"
              style={{ backgroundColor: "#f3e8ff", color: "#7e22ce" }}
            >
              <ShoppingCart size={36} className="mb-2" />
              <div className="fs-1 fw-bold mb-1">{boughtCourses}</div>
              <div className="fs-5 fw-semibold text-gray-700">
                Học viên đã mua
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <CourseRevenueChart data={revenueChartData} />
          </div>
          <div className="col-12 col-lg-6">
            <CoursesSoldChart data={soldChartData} />
          </div>
        </div>
      </div>
    </>
  );
}
