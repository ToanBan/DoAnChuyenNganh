import React from "react";
import styles from "./page.module.css"; // Import the CSS module

const AboutPage = () => {

    
  return (
    <>
      <section className={`${styles.heroSection} text-white py-5 py-md-5 py-lg-5`}>
        <div className="container text-center">
          <h1 className="display-4 fw-bold lh-base mb-4">
            Về chúng tôi: Nơi kiến thức khai phóng tiềm năng của bạn
          </h1>
          <p className="fs-5 fs-md-4 max-w-3xl mx-auto mb-4 opacity-90">
            Chào mừng bạn đến với{" "}
            <span className="fw-bold">CourseBase</span> –
            cộng đồng học tập trực tuyến được xây dựng với sứ mệnh truyền cảm
            hứng, trang bị kiến thức và khai phóng tiềm năng cho mọi cá nhân
            khao khát phát triển.
          </p>
          <p className="fs-6 fs-md-5 max-w-4xl mx-auto opacity-80">
            Tại{" "}
            <span className="fw-bold">CourseBase</span>,
            chúng tôi tin rằng{" "}
            <strong className="text-warning">
              học tập là một hành trình không ngừng nghỉ
            </strong>
            , và ai cũng có quyền tiếp cận những kiến thức chất lượng nhất để
            vươn tới thành công. Chúng tôi không chỉ cung cấp các khóa học;
            chúng tôi kiến tạo một môi trường nơi sự tò mò được khuyến khích, kỹ
            năng được mài giũa, và những ý tưởng mới được ươm mầm.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-5">
        <div className="container">
          <h2 className={styles.sectionHeading}>Sứ mệnh của chúng tôi</h2>
          <div className={`${styles.card} text-center p-4 p-md-5`}>
            <p className="fs-5 fs-md-4 lh-base">
              <strong className="text-primary">
                Trao quyền cho bạn kiến tạo tương lai:
              </strong>{" "}
              Chúng tôi cam kết mang đến những khóa học chất lượng cao, được
              thiết kế bởi các chuyên gia hàng đầu, giúp bạn trang bị kiến thức
              và kỹ năng cần thiết để tự tin đối mặt với những thách thức và nắm
              bắt cơ hội trong thế giới không ngừng thay đổi.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-light py-5">
        <div className="container">
          <h2 className={styles.sectionHeading}>
            Điều gì làm nên sự khác biệt của chúng tôi?
          </h2>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
            {/* Card 1: Chất lượng */}
            <div className="col">
              <div className={`${styles.card} h-100 d-flex flex-column align-items-center text-center p-4`}>
                <svg
                  className="w-16 h-16 text-primary mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ width: "4rem", height: "4rem" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <h3 className={styles.subHeading}>Chất lượng là trọng tâm</h3>
                <p className="text-secondary">
                  Mỗi khóa học trên CourseBase đều được
                  tuyển chọn kỹ lưỡng và phát triển dựa trên những tiêu chuẩn
                  cao nhất. Nội dung được cập nhật liên tục, đảm bảo tính ứng
                  dụng và phù hợp với xu hướng thị trường.
                </p>
              </div>
            </div>
            {/* Card 2: Giảng viên chuyên gia */}
            <div className="col">
              <div className={`${styles.card} h-100 d-flex flex-column align-items-center text-center p-4`}>
                <svg
                  className="w-16 h-16 text-success mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ width: "4rem", height: "4rem" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.747 0-3.332.477-4.5 1.253"
                  ></path>
                </svg>
                <h3 className={styles.subHeading}>
                  Giảng viên là chuyên gia thực chiến
                </h3>
                <p className="text-secondary">
                  Bạn sẽ được học hỏi trực tiếp từ những giảng viên là chuyên
                  gia, người có kinh nghiệm thực tế sâu rộng trong lĩnh vực của
                  họ.
                </p>
              </div>
            </div>
            {/* Card 3: Trải nghiệm cá nhân hóa */}
            <div className="col">
              <div className={`${styles.card} h-100 d-flex flex-column align-items-center text-center p-4`}>
                <svg
                  className="w-16 h-16 text-info mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ width: "4rem", height: "4rem" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
                <h3 className={styles.subHeading}>Trải nghiệm học tập cá nhân hóa</h3>
                <p className="text-secondary">
                  Nền tảng của chúng tôi được thiết kế linh hoạt, cho phép bạn
                  học theo tốc độ của riêng mình, tương tác với giảng viên và
                  cộng đồng.
                </p>
              </div>
            </div>
            {/* Card 4: Cộng đồng năng động */}
            <div className="col">
              <div className={`${styles.card} h-100 d-flex flex-column align-items-center text-center p-4`}>
                <svg
                  className="w-16 h-16 text-warning mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ width: "4rem", height: "4rem" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H2v-2a4 4 0 014-4h12.713M17 20v-9.287m0 0a5.998 5.998 0 00-4.723-2.615M17 20h2m0 0a5.998 5.998 0 01-4.723-2.615M17 20v-9.287m0 0a5.998 5.998 0 00-4.723-2.615M17 20h2m0 0a5.998 5.998 0 01-4.723-2.615"
                  ></path>
                </svg>
                <h3 className={styles.subHeading}>Cộng đồng học tập năng động</h3>
                <p className="text-secondary">
                  Khi tham gia CourseBase, bạn không chỉ
                  mua một khóa học, mà còn gia nhập một cộng đồng những người có
                  cùng chí hướng.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Journey Section */}
      <section className="py-5">
        <div className="container">
          <h2 className={styles.sectionHeading}>Hành trình của chúng tôi</h2>
          <div
            className={`${styles.card} text-center p-4 p-md-5 mx-auto`}
            style={{ maxWidth: "800px" }}
          >
            <p className="fs-5 fs-md-4 lh-base">
              CourseBase được thành lập vào{" "}
              <strong className="text-primary">2025</strong> với tầm
              nhìn tạo ra một nền tảng học tập trực tuyến đột phá. Bắt đầu từ
              những ngày đầu còn nhiều khó khăn, chúng tôi đã không ngừng nỗ
              lực, lắng nghe phản hồi từ người học và cải tiến sản phẩm để mang
              đến trải nghiệm tốt nhất. Cho đến nay, chúng tôi tự hào đã giúp
              hàng ngàn học viên đạt được mục tiêu học tập và nghề nghiệp của
              họ.
            </p>
          </div>
        </div>
      </section>

      {/* Meet Our Team Section */}
      <section className="bg-light py-5">
        <div className="container">
          <h2 className={styles.sectionHeading}>Gặp gỡ đội ngũ của chúng tôi</h2>
          <p
            className="text-center fs-5 mb-4 mx-auto"
            style={{ maxWidth: "600px" }}
          >
            Đằng sau mỗi khóa học chất lượng là một đội ngũ đầy nhiệt huyết và
            tận tâm. Từ các chuyên gia nội dung, kỹ thuật viên nền tảng, đến đội
            ngũ hỗ trợ học viên, tất cả chúng tôi đều chung một mục tiêu:{" "}
            <strong className="text-primary">giúp bạn thành công.</strong>
          </p>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 d-flex justify-content-center">
            
            <div className="col">
              <div className={`${styles.card} h-100 d-flex flex-column align-items-center text-center p-4`}>
                <img
                  src="https://placehold.co/120x120/a8dadc/1d3557?text=Team+Member+2"
                  alt="Team Member 2"
                  className="img-fluid rounded-circle mb-3"
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                  }}
                />
                <h3 className="fs-5 fw-semibold text-dark mb-2">
                  Nhữ Đình Huy
                </h3>
                <p className="text-primary fw-medium mb-2">
                  Công Nghê Thông Tin
                </p>
                <p className="text-secondary fs-6">
                  Công Nghệ Phần Mềm
                </p>
              </div>
            </div>
            
            <div className="col">
              <div className={`${styles.card} h-100 d-flex flex-column align-items-center text-center p-4`}>
                <img
                  src="https://placehold.co/120x120/e0b1cb/1d3557?text=Team+Member+1"
                  alt="Team Member 1"
                  className="img-fluid rounded-circle mb-3"
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                  }}
                />
                <h3 className="fs-5 fw-semibold text-dark mb-2">Lê Toàn Bân</h3>
                <p className="text-primary fw-medium mb-2">
                  Công Nghệ Thông Tin
                </p>
                <p className="text-secondary fs-6">
                  Công Nghệ Phần Mềm
                </p>
              </div>
            </div>
            <div className="col">
              <div className={`${styles.card} h-100 d-flex flex-column align-items-center text-center p-4`}>
                <img
                  src="https://placehold.co/120x120/c7f0d4/1d3557?text=Team+Member+3"
                  alt="Team Member 4"
                  className="img-fluid rounded-circle mb-3"
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                  }}
                />
                <h3 className="fs-5 fw-semibold text-dark mb-2">Cao Minh Huy</h3>
                <p className="text-primary fw-medium mb-2">
                  Công Nghệ Thông Tin
                </p>
                <p className="text-secondary fs-6">
                  Công Nghệ Phần Mềm
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className={`${styles.ctaSection} text-white py-5`}>
        <div className="container text-center">
          <h2 className="display-5 fw-bold mb-4">
            Bắt đầu hành trình của bạn ngay hôm nay!
          </h2>
          <p className="fs-5 fs-md-4 max-w-3xl mx-auto mb-4 opacity-90">
            Dù bạn đang tìm kiếm cơ hội nâng cao kỹ năng chuyên môn, khám phá
            một sở thích mới, hay đơn giản là muốn mở rộng kiến thức, [Tên trang
            web khóa học của bạn] luôn sẵn sàng đồng hành cùng bạn.
          </p>
          <a href="#" className={`${styles.btnPrimaryCustom} btn d-inline-block`}>
            Khám phá các khóa học của chúng tôi
          </a>
        </div>
      </section>
    </>
  );
};

export default AboutPage;
