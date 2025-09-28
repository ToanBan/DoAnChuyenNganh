
export default function CancelPage() {
  return (
    <div className="container py-5 text-center">
      <h1>❌ Thanh toán bị hủy</h1>
      <p>Bạn đã hủy thanh toán. Nếu cần, vui lòng thử lại.</p>
      <a href="/cart" className="btn btn-secondary mt-3">Quay lại giỏ hàng</a>
    </div>
  );
}