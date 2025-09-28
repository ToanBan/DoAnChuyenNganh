"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

const ShopCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/cart", {
        credentials: "include",
      });
      const data = await res.json();
      setCartItems(data.items || []);
    } catch (err) {
      console.error(err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart(); 
    const handler = () => {
      fetchCart(); 
    };
    window.addEventListener("cart-updated", handler);
    return () => {
      window.removeEventListener("cart-updated", handler);
    };
  }, []);


  const total = cartItems.reduce((sum, it) => sum + it.price * it.quantity, 0);

  return (
    <div
      className="offcanvas offcanvas-end shadow-lg border-start"
      tabIndex={-1}
      id="cart"
      aria-labelledby="cartLabel"
    >
      <div className="offcanvas-header border-bottom">
        <h5 className="offcanvas-title fw-bold" id="cartLabel">
          <ShoppingCart className="me-2" size={30} /> Giỏ Hàng
        </h5>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="offcanvas"
        />
      </div>
      <div className="offcanvas-body">
        {loading ? (
          <div>Đang tải giỏ hàng...</div>
        ) : cartItems.length === 0 ? (
          <div>Giỏ hàng trống!</div>
        ) : (
          cartItems.map((item) => (
            <div
              key={item.id}
              className="d-flex align-items-center justify-content-between p-2 mb-3 rounded border"
            >
              <div className="d-flex align-items-center">
                <div
                  className="bg-success-subtle text-success-emphasis rounded p-2 text-center me-3"
                  style={{ minWidth: 80 }}
                >
                  <small className="d-block">{item.name}</small>
                </div>
                <div>
                  <div className="fw-semibold">{item.name}</div>
                  <div className="text-muted">
                    {item.price.toLocaleString()} đ
                  </div>
                </div>
              </div>
              
            </div>
          ))
        )}

        <div className="border-top pt-3">
          <div className="d-flex justify-content-between mb-2">
            <span>Tạm tính:</span>
            <span>{total.toLocaleString()} đ</span>
          </div>
         
          <div className="d-flex justify-content-between fw-bold fs-5 border-top pt-2">
            <span>Tổng cộng:</span>
            <span className="text-danger">{total} đ</span>
          </div>
        </div>
      </div>
      <div className="offcanvas-footer">
        <Link href={"/cart"} className="btn btn-primary w-100 mt-3">
          Xem Giỏ Hàng
        </Link>
      </div>
    </div>
  );
};

export default ShopCart;
