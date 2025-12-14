import React from 'react'

const GetMessages = async(teacherId:string) => {
  try {
    const res = await fetch(`http://localhost:5000/api/messages/${teacherId}`, {
        method:"GET", 
        credentials:"include", 
        headers:{
            "Content-Type":"application/json"
        }
    })

    if(res.ok){
        const data = await res.json();
        return data.message
    }
  } catch (error) {
    console.error(error);
    return []
  }
}

export default GetMessages
