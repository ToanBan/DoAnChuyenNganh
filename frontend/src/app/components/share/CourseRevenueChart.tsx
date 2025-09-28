"use client";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: { month: string; revenue: number }[];
}

const CourseRevenueChart = ({ data }: Props) => {
  return (
    <div className="mt-5" style={{ width: "100%", height: "300px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "#666" }}
            label={{
              value: "Doanh thu theo tháng",
              position: "insideBottom",
              offset: -5,
              style: { fill: "#888", fontSize: 14 },
            }}
          />

          <YAxis
            tickFormatter={(value) => `${value / 1_000_000}tr`}
            tick={{ fontSize: 12 }}
          />

          <Tooltip
            formatter={(value: number) => `${value.toLocaleString()} đ`}
          />

          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#8884d8"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CourseRevenueChart;
