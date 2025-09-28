import React from 'react'

const AlertError = ({message}:{message:string}) => {
  return (
    <>
        <div className="alert-failed" style={{position:"fixed", top:"10px", right:0, zIndex:"1000"}}>
        <span className="icon">✗</span>
        <span className="message">{message}</span>
        <button className="close-btn">×</button>
    </div>
    </>
  )
}

export default AlertError
