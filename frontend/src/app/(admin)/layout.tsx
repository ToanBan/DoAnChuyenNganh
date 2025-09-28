'use client'

import Sidebar from "@/components/Sidebar";
import { Box } from "@mui/material";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="d-flex">
        <Sidebar/>
        <Box sx={{ flexGrow: 1, marginTop:"4rem"}}>{children}</Box>
      </div>
    </>
  );
}
