"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import AlertSuccess from "@/app/components/share/alert_success";
interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  role: string;
  phone: string;
  Teacher: {
    id: string;
    avatar: string;
  };
}

const UsersPageAdmin = () => {
  const [users, setUsers] = useState<User[] | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const imageUrl = "http://localhost:5000/uploads/";

  const GetUsers = async () => {
    const res = await fetch("http://localhost:5000/api/admin/users", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    setUsers(data.message);
  };

  

  useEffect(() => {
    GetUsers();
  }, []);

  const handleSendRole = async() => {
    const res = await fetch("http://localhost:5000/api/admin/role", {
      method:"POST", 
      credentials:"include",
      body:JSON.stringify({selectedUserId, selectedRole}), 
      headers:{
        "Content-Type":"application/json"
      }
    })    

    const data = await res.json();
    if(res.status === 200){
      setSuccess(true);
      setTimeout(()=>{
        setSuccess(false)
      }, 3000);
      GetUsers();
      setSelectedUserId("");
    }
   
  };

  return (
    <div className="content">
      <div className="card shadow-lg rounded-3 p-4 w-100 max-w-4xl border border-primary-subtle">
        <h2 className="h2 fw-bolder text-center text-primary mb-4">
          NGƯỜI DÙNG
        </h2>
        <div className="table-responsive">
          <table className="table table-hover table-bordered rounded-3 overflow-hidden">
            <thead className="table-light">
              <tr>
                <th className="p-3 text-start small text-secondary text-uppercase rounded-top-left">
                  Ảnh
                </th>
                <th className="p-3 text-start small text-secondary text-uppercase">
                  Tên
                </th>
                <th className="p-3 text-start small text-secondary text-uppercase">
                  Email
                </th>
                <th className="p-3 text-start small text-secondary text-uppercase">
                  Vai Trò
                </th>
                <th className="p-3 text-start small text-secondary text-uppercase">
                  Thao Tác
                </th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => (
                <tr key={user.id}>
                  <td className="p-3 text-nowrap">
                    <Image
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                      className="img-fluid rounded-circle mb-4 border border-3 border-info shadow-sm"
                      src={
                        user.Teacher?.avatar
                          ? `${imageUrl}${user.Teacher.avatar}`
                          : "https://www.lewesac.co.uk/wp-content/uploads/2017/12/default-avatar.jpg"
                      }
                      width={30}
                      height={30}
                      alt={`${user.avatar}`}
                    />
                  </td>
                  <td className="p-3 text-nowrap small fw-medium text-dark">
                    {user.username}
                  </td>
                  <td className="p-3 text-nowrap small text-muted">
                    {user.email}
                  </td>
                  <td className="p-3 text-nowrap small text-muted">
                    {user.role}
                  </td>
                  <td className="p-3 text-nowrap">
                    {selectedUserId !== user.id && (
                      <button className="btn btn-outline-danger me-2">
                        XÓA
                      </button>
                    )}

                    {selectedUserId === user.id ? (
                      <div className="d-flex align-items-center gap-2">
                        <select
                          className="form-select form-select-sm w-auto"
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                        >
                          <option value="">--Chọn vai trò--</option>
                          <option value="user">Người dùng</option>
                          <option value="teacher">Giáo viên</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={handleSendRole}
                          disabled={!selectedRole}
                        >
                          Gửi
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setSelectedUserId(null)}
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-outline-success"
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setSelectedRole(user.role);
                        }}
                      >
                        Gán Vai Trò
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {success && (<AlertSuccess message="Cập Nhật Vai Trò Thành Công"/>)}
    </div>
  );
};

export default UsersPageAdmin;
