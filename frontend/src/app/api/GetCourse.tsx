import React from "react";

const GetCourse = async() => {
  try {
    const res = await fetch("http://localhost:5000/api/courses", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    return data.message;
  } catch (e) {
    console.error("Error in GetAuthUser:", e);
    return;
  }
};

export default GetCourse;
