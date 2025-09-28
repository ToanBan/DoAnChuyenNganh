// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const adminPath = "/admin";
const teacherPath = "/teacher"
let userRole = null;
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }
  try {
    const res = await fetch("http://localhost:5000/api/role", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Invalid response from backend");
    }

    const data = await res.json();
    userRole = data.message
  } catch (err) {
    console.error("Error checking role:", err);
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (pathname.startsWith(adminPath)) {
    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  if (pathname.startsWith(teacherPath)) {
    if (userRole !== "teacher") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }


  
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/teacher", "/teacher/:path*"],
};
