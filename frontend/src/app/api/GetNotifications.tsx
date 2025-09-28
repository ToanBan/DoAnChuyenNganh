'use client'
import React from "react";

const GetNotifications = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/notifications", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials:"include"
    });

    const data = await res.json();
    return data;
  } catch (e) {
    console.error("Error in GetAuthUser:", e);
    return;
  }
};

export default GetNotifications;
