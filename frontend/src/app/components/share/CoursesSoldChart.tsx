import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Props {
  data: { month: string; sold: number }[];
}

const CoursesSoldChart = ({ data }: Props) => {
  return (
    <div className="mt-5" style={{ width: "100%", height: 300 }}>
      
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis  dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} />
          <Tooltip formatter={(value: number) => `${value} khóa học`} />
          <Legend />
          <Bar dataKey="sold" fill="#10b981" name="Khóa học đã bán" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CoursesSoldChart;
