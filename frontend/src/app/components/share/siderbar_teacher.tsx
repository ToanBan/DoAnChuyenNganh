import React from "react";
import { FontAwesomeIcon  } from '@fortawesome/react-fontawesome';
import Link from "next/link";
import {
  faChalkboardTeacher,
  faChartLine,
  faBook,
  faUsers,
  faDollarSign,
  faBell,
  faCheckCircle,
  faUser,
  faSignOutAlt,
  faBars
} from '@fortawesome/free-solid-svg-icons';
import Image from "next/image";
const SiderbarTeacher = () => {
  return (
    <>
      <div className="sidebar" id="sidebar">
        <div className="d-flex align-items-center mb-4">
           <Image
            src="data:image/png;base64,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" // Bạn có thể thay bằng base64 hoặc đường dẫn logo khác
            alt="CourseBase Logo"
            width={40}
            height={40}
          />

          <h4 className="m-0 ms-2" style={{fontSize:"30px", fontWeight:"700", fontStyle:"italic"}}>TEACHER</h4>
          
        </div>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link href={'/teacher/dashboard'} className="nav-link text-dark">
             <FontAwesomeIcon  icon={faChartLine} className="me-2" style={{color:"cornflowerblue"}} />
              Overview
            </Link>
            
          </li>
          <li className="nav-item">
            <Link href={'/teacher/courses'} className="nav-link text-dark">
             <FontAwesomeIcon  icon={faBook} className="me-2" style={{color:"cornflowerblue"}} />
              Courses
            </Link>
           
          </li>
          <li className="nav-item">
            <Link href={'/teacher/students'} className="nav-link text-dark">
             <FontAwesomeIcon  icon={faUsers} className="me-2" style={{color:"cornflowerblue"}} />
              Students
            </Link>
            
          </li>
        
          <li className="nav-item">
            <a className="nav-link text-dark" href="#">
              <FontAwesomeIcon  icon={faSignOutAlt} className="me-2" style={{color:"cornflowerblue"}} />
              QUIT
            </a>
          </li>
        </ul>
      </div>

      <button className="toggle-sidebar" id="toggleSidebar">
        <FontAwesomeIcon  icon={faBars} />
      </button>
    </>
  );
};

export default SiderbarTeacher;
