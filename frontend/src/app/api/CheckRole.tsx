import React from "react";

const CheckRole = async() => {
  try {
    const res = await fetch("http://localhost:5000/api/role", {
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

export default CheckRole;
