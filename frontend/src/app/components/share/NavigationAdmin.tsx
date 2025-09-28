import React, { useRef } from "react";
import Notifications from "./Notifications";
import LoginPartial from "./loginpartial";
const NavigationAdmin_Teacher = () => {
  const userMenuRef = useRef(null);
  const notificationBellRef = useRef(null);

  return (
    <div>
      <style>
        {`
          body {
            font-family: "Inter", sans-serif;
          }
          /* Custom hover background for primary elements */
          .hover-bg-primary-dark:hover {
            background-color: #0056b3; /* A darker shade of Bootstrap's primary blue */
          }
          /* Avatar size */
          .avatar-sm {
            width: 40px;
            height: 40px;
          }
          /* Wider dropdown for notifications */
          .notification-dropdown-menu {
            min-width: 280px;
          }
          /* Hide Bootstrap's default dropdown caret */
          .dropdown-toggle::after {
            display: none;
          }

          /* Custom CSS for hover dropdowns */
          .dropdown.hover-dropdown .dropdown-menu {
            display: none; /* Hide by default */
          }
          .dropdown.hover-dropdown:hover .dropdown-menu {
            display: block; /* Show on hover */
          }

          /* Custom styling for notification button on hover/focus */
          .notification-button:hover,
          .notification-button:focus {
            background-color: rgba(255, 255, 255, 0.2); /* Light overlay on hover/focus */
            outline: none; /* Remove default focus outline */
            box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25); /* Bootstrap-like focus ring */
          }

          /* Custom styling for user info div on hover */
          .user-info-hover:hover {
            background-color: rgba(255, 255, 255, 0.2); /* Light overlay on hover */
          }

          /* Custom styling for dropdown items on hover */
          .dropdown-item:hover {
            background-color: #f8f9fa; /* Light gray for hover, similar to Bootstrap's default */
          }
        `}
      </style>
      <header className="bg-primary text-white shadow d-flex justify-content-between align-items-center py-1 position-fixed" style={{width:"100%", zIndex:5}}>
        <div className="d-flex align-items-center">
        </div>
        <div className="d-flex align-items-center gap-3"> 
          
          <Notifications/>
          {/* User Info Dropdown */}
          <div className="dropdown hover-dropdown" ref={userMenuRef}>
            <div
              className="d-flex align-items-center gap-2 p-2 rounded-pill cursor-pointer user-info-hover"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              role="button"
              style={{marginRight:"88px"}}
            >
              <LoginPartial/>
              <img
                src="https://placehold.co/40x40/3498db/ffffff?text=AD"
                alt="Avatar"
                className="avatar-sm rounded-circle border border-2 border-white object-fit-cover"
              />
            </div>
           
          </div>
        </div>
      </header>
    </div>
  );
};

export default NavigationAdmin_Teacher;
