import React from 'react'

const Loading = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="d-flex justify-content-center align-items-center rounded-xl shadow-lg flex flex-col items-center w-full max-w-sm" style={{height:"80vh"}}>
        <div className="dot-wave-container">
          <div className="dot dot-1"></div>
          <div className="dot dot-2"></div>
          <div className="dot dot-3"></div>
          <div className="dot dot-4"></div>
          <div className="dot dot-5"></div>
        </div>
      </div>
    </div>
  );
}

export default Loading
