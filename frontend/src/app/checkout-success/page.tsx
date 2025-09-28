"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface SessionDetail {
  customer_email?: string;
  amount_total?: number;
}

export default function CheckoutSuccessPage() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<SessionDetail>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("Không tìm thấy session_id trong URL.");
      setLoading(false);
      return;
    }
    fetch(`http://localhost:5000/api/checkout/session?session_id=${sessionId}`, {
      credentials: "include",
    })
      .then(async res => {
        if (!res.ok) throw new Error((await res.json()).message);
        return res.json();
      })
      .then(data => {
        setDetail({
          customer_email: data.customer_email,
          amount_total: data.amount_total
        });
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="col-md-8 col-lg-6">
        <div className="card shadow-lg border-0 p-4 text-center">
          {loading ? (
            <div className="py-5">
              <div className="spinner-border text-primary mb-3" role="status"></div>
              <p className="mb-0">Đang tải thông tin đơn hàng…</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <>
              <div className="text-success display-3 mb-3">
                <i className="bi bi-check-circle-fill"></i>
              </div>
              <h2 className="mb-3">Thanh toán thành công 🎉</h2>
              <p className="text-muted">
                Cảm ơn bạn đã mua khoá học với chúng tôi.
              </p>

              <div className="text-start mb-4">
                {detail.customer_email && (
                  <p><strong><i className="bi bi-envelope me-2"></i>Email:</strong> {detail.customer_email}</p>
                )}
                {detail.amount_total != null && (
                  <p>
                    <strong><i className="bi bi-cash-stack me-2"></i>Số tiền:</strong>{" "}
                    {detail.amount_total.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </p>
                )}
              </div>

              <p className="mb-4">Bạn có thể bắt đầu học ngay hoặc quay về xem thêm khóa học khác.</p>

              <div className="d-flex justify-content-center gap-3">
                <Link href="/courses" className="btn btn-outline-primary">
                  <i className="bi bi-arrow-left me-1"></i> Khóa học khác
                </Link>
                <Link href="/profile" className="btn btn-success">
                  <i className="bi bi-play-circle me-1"></i> Học ngay
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
