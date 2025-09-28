import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className="footer-gradient text-gray-300 py-5 mt-auto">
          <div className="container">
              <div className="row row-cols-1 row-cols-md-4 g-4">
                  <div className="col">
                      <h3 className="footer-heading mb-3">CourseBase</h3>
                      <p className="small text-dark">Nền tảng học trực tuyến hàng đầu, mang đến tri thức cho mọi người.</p>
                      <div className="d-flex mt-4">
                          <a style={{fontSize:"24px", color:"black"}} href="#" className="social-icon" aria-label="Facebook">
                              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.04C6.5 2.04 2 6.54 2 12.04C2 17.04 5.5 21.24 10.5 21.94V14.94H7.6V12.04H10.5V9.84C10.5 6.84 12.3 5.24 14.9 5.24C16.1 5.24 17.3 5.44 17.3 5.44V8.24H15.6C14.1 8.24 13.8 9.14 13.8 10.14V12.04H17.2L16.7 14.94H13.8V21.94C18.8 21.24 22.3 17.04 22.3 12.04C22.3 6.54 17.8 2.04 12 2.04Z"></path></svg>
                          </a>
                          <a style={{fontSize:"24px", color:"black"}} href="#" className="social-icon" aria-label="Twitter">
                              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M22.46 6C21.69 6.33 20.87 6.56 20 6.69C20.88 6.16 21.56 5.31 21.88 4.31C21.05 4.81 20.13 5.16 19.16 5.36C18.37 4.5 17.27 4 16.05 4C13.73 4 11.83 5.92 11.83 8.25C11.83 8.58 11.87 8.91 11.94 9.22C8.29 9.04 5.09 7.3 2.96 4.65C2.59 5.27 2.38 5.97 2.38 6.74C2.38 8.28 3.16 9.66 4.38 10.46C3.65 10.44 2.97 10.23 2.36 9.9C2.36 9.91 2.36 9.92 2.36 9.94C2.36 12.07 3.86 13.89 5.86 14.29C5.5 14.38 5.13 14.44 4.75 14.44C4.49 14.44 4.23 14.41 3.98 14.35C4.54 16.1 6.13 17.3 8.08 17.33C6.56 18.52 4.67 19.23 2.63 19.23C2.29 19.23 1.96 19.21 1.63 19.16C3.62 20.44 5.97 21.23 8.5 21.23C16.04 21.23 20.17 15.14 20.17 9.77C20.17 9.61 20.17 9.46 20.16 9.3C20.99 8.71 21.72 7.9 22.46 7Z"></path></svg>
                          </a>
                          <a style={{fontSize:"24px", color:"black"}} href="#" className="social-icon" aria-label="Instagram">
                              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M7.8 2C5.6 2 3.9 3.7 3.9 5.9V18.1C3.9 20.3 5.6 22 7.8 22H16.2C18.4 22 20.1 20.3 20.1 18.1V5.9C20.1 3.7 18.4 2 16.2 2H7.8ZM12 7C14.7 7 17 9.3 17 12C17 14.7 14.7 17 12 17C9.3 17 7 14.7 7 12C7 9.3 9.3 7 12 7ZM18 5C17.4 5 17 5.4 17 6C17 6.6 17.4 7 18 7C18.6 7 19 6.6 19 6C19 5.4 18.6 5 18 5Z"></path></svg>
                          </a>
                          <a style={{fontSize:"24px", color:"black"}} href="#" className="social-icon" aria-label="LinkedIn">
                              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.564c0-1.328-.027-3.044-1.852-3.044c-1.853 0-2.136 1.445-2.136 2.951v5.657H9.249V9.309h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85c3.601 0 4.267 2.37 4.267 6.879v6.218zM5.048 7.487c-1.22 0-2.2-.993-2.2-2.213c0-1.23 1.01-2.213 2.2-2.213c1.21 0 2.2.983 2.2 2.213c0 1.22-.99 2.213-2.2 2.213zm-1.765 12.965h3.53V9.309H3.283v11.143z"></path></svg>
                          </a>
                      </div>
                  </div>
                  <div className="col">
                      <h3 className="footer-heading mb-3">Khóa Học</h3>
                      <ul className="list-unstyled space-y-2">
                          <li><a href="#" className="footer-link text-dark text-decoration-none">Lập Trình</a></li>
                          <li><a href="#" className="footer-link text-dark text-decoration-none">Marketing</a></li>
                          <li><a href="#" className="footer-link text-dark text-decoration-none">Thiết Kế</a></li>
                          <li><a href="#" className="footer-link text-dark text-decoration-none">Ngoại Ngữ</a></li>
                      </ul>
                  </div>
                  <div className="col">
                      <h3 className="footer-heading mb-3">Về Chúng Tôi</h3>
                      <ul className="list-unstyled space-y-2">
                          <li><a href="#" className="footer-link text-dark text-decoration-none">Giới Thiệu</a></li>
                          <li><a href="#" className="footer-link text-dark text-decoration-none">Đội Ngũ</a></li>
                          <li><a href="#" className="footer-link text-dark text-decoration-none">Tuyển Dụng</a></li>
                      </ul>
                  </div>
                  <div className="col">
                      <h3 className="footer-heading mb-3">Liên Hệ</h3>
                      <ul className="list-unstyled space-y-2 text-light">
                          <li className='text-dark'>Email: info@eduhub.com</li>
                          <li className='text-dark'>Điện thoại: 0123 456 789</li>
                          <li className='text-dark'>Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</li>
                      </ul>
                  </div>
              </div>
              <div className="text-center small text-gray-500 mt-5 pt-4 border-top border-secondary-subtle">
                  &copy; 2025 EduHub. Mọi quyền được bảo lưu.
              </div>
          </div>
      </footer>
  );
}