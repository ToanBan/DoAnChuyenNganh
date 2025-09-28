"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CreditCard, Square, CheckSquare, Trash2, ChevronLeft } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshCartCount } = useCart();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/cart", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.items)) {
        setCartItems(data.items);
      } else {
        setCartItems([]);
      }
    } catch {
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const toggleSelect = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.id));
    }
  };

  const handleRemove = async (courseId: number) => {
    const res = await fetch("http://localhost:5000/api/cart/remove", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    if (res.ok) {
      await refreshCartCount();
      fetchCart();
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch(
        "http://localhost:5000/api/checkout/create-session",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selectedItems }), 
        }
      );
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        
      } else {
        alert("Không thể khởi tạo thanh toán.");
      }
    } catch {
      alert("Không thể khởi tạo thanh toán.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Chỉ tính tổng tiền theo sản phẩm đã chọn
  const subTotal = cartItems
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="container py-5">
      <h1 className="mb-4">Giỏ Hàng</h1>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : cartItems.length === 0 ? (
        <div className="alert alert-info text-center">
          Giỏ hàng của bạn hiện đang trống.
        </div>
      ) : (
        <div className="row">
          {/* danh sách sản phẩm */}
          <div className="col-lg-8 mb-4">
            <div className="table-responsive shadow-sm rounded">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="text-center" style={{ width: "50px" }}>
                      <button
                        className="btn btn-link p-0"
                        onClick={toggleSelectAll}
                        title="Chọn tất cả"
                      >
                        {selectedItems.length === cartItems.length &&
                        cartItems.length > 0 ? (
                          <CheckSquare size={18} />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>
                    </th>
                    <th>Sản phẩm</th>
                    <th className="text-center">Giá</th>
                    <th className="text-center">Thành tiền</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id}>
                      {/* Checkbox chọn sản phẩm */}
                      <td className="text-center">
                        <button
                          className="btn btn-link p-0"
                          onClick={() => toggleSelect(item.id)}
                        >
                          {selectedItems.includes(item.id) ? (
                            <CheckSquare size={18} />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                      </td>

                      <td>
                        <div className="d-flex align-items-center">
                          {item.image && (
                            <Image
                              src={`http://localhost:5000/uploads/${item.image}`}
                              alt={item.name}
                              width={80}
                              height={80}
                              className="rounded"
                            />
                          )}
                          <span className="ms-3">{item.name}</span>
                        </div>
                      </td>
                      <td className="text-center">
                        {item.price.toLocaleString()} đ
                      </td>
                      <td className="text-center">
                        {(item.price * item.quantity).toLocaleString()} đ
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleRemove(item.id)}
                        >
                          <Trash2 size={16} className="me-1" />
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* nút tiếp tục mua hàng */}
            <div className="mt-4">
              <Link
                href="/courses"
                className="btn btn-outline-secondary shadow-sm"
              >
                <ChevronLeft size={16} className="me-1" />
                Tiếp tục mua hàng
              </Link>
            </div>
          </div>

          {/* tóm tắt đơn hàng */}
          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h5 className="mb-0">Tóm tắt đơn hàng</h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span>Tạm tính:</span>
                  <span>{subTotal.toLocaleString()} đ</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Phí vận chuyển:</span>
                  <span>0 đ</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold fs-5">
                  <span>Tổng cộng:</span>
                  <span className="text-danger">
                    {subTotal.toLocaleString()} đ
                  </span>
                </div>
                <button
                  className="btn btn-success btn-lg w-100 mt-4 shadow-lg rounded-pill d-flex align-items-center justify-content-center"
                  onClick={handleCheckout}
                  disabled={checkoutLoading || selectedItems.length === 0}
                >
                  {checkoutLoading ? (
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />
                  ) : (
                    <CreditCard size={20} className="me-2" />
                  )}
                  {checkoutLoading ? "Đang xử lý..." : "Thanh toán ngay"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
