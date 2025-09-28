"use client";

import React, { useState } from "react";
import Image from "next/image";


const SearchPage = () => {
  const [searchValue, setSearchValue] = useState("");


  const handleSearch = () => {
    if (searchValue.trim()) {
      window.location.href = `/search?query=${encodeURIComponent(searchValue)}`
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
      <div
        className="modal fade full-screen"
        id="searchModal"
        aria-labelledby="searchModalLabel"
        aria-hidden="true"
        tabIndex={-1}
      >
        <div className="modal-dialog full-screen">
          <div className="modal-content full-screen">
            <div className="modal-header">
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm khóa học"
                  aria-label="Tìm kiếm khóa học"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <span
                  className="input-group-text"
                  style={{ cursor: "pointer" }}
                  onClick={handleSearch}
                >
                  <Image
                    src="https://cdn-icons-png.flaticon.com/128/2811/2811806.png"
                    alt="search"
                    width={28}
                    height={28}
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchPage;
