"use client";
import React from "react";

const GetCountCart = async () => {
  const res = await fetch("http://localhost:5000/api/count_cart_item", {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (res.status !== 200) {
    return 0;
  }
  const data = await res.json();
  return data.message;
};

export default GetCountCart;
