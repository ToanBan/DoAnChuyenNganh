"use client";
import React, { useEffect, useState, useRef } from "react";
import socket from "@/lib/socket";
import NavigationAdmin_Teacher from "@/app/components/share/NavigationAdmin";


interface Student {
  student_id: string;
  student_avatar: string;
  student_name: string;
  student_email: string;
  student_phone: string;
}

interface Message {
  id?: number;
  roomId: number;
  sender: "user" | "teacher";
  content: string;
  createdAt?: string;
}

const imageUrl = "http://localhost:5000/uploads/";

const TeacherMessagePage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [chatroomId, setChatroomId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const GetStudents = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/teacher_students", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        
        const data = await res.json();
        const userList = Array.isArray(data.message) ? data.message : [];
        const studentList: Student[] = userList.map((user: any) => ({
          student_id: String(user.id), // API trả về 'id' chứ không phải 'student_id'
          student_name: user.username || "Chưa có tên",
          student_email: user.email || "",
          student_phone: user.phone || "",
          student_avatar: user.avatar || "",
        }));
        
        console.log("✅ Mapped students:", studentList);
        setStudents(studentList);
      } catch (err) {
        console.error("❌ Lỗi lấy danh sách sinh viên:", err);
        setStudents([]);
      }
    };
    GetStudents();

    socket.on("receiveChatMessage", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receiveChatMessage");
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setMessages([]);
    const roomId = parseInt(student.student_id); 
    setChatroomId(roomId);
    socket.emit("joinChatRoom", roomId);
  };

  const sendMessage = () => {
    if (!input.trim() || !chatroomId) return;
    const msg: Message = { roomId: chatroomId, sender: "teacher", content: input };
    socket.emit("sendChatMessage", msg);
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <NavigationAdmin_Teacher />
      <div className="content" style={{ height: "calc(100vh - 80px)", overflow: "hidden" }}>
        <div className="container-fluid h-100">
          <div className="row h-100">
            {/* Danh sách sinh viên - Sidebar trái */}
            <div className="col-md-4 col-lg-3 border-end bg-light h-100 overflow-auto p-0">
              <div className="p-3 sticky-top" style={{ background: "linear-gradient(135deg, #007bff, #0056b3)" }}>
                <h5 className="mb-0 text-dark">💬 Danh sách sinh viên</h5>
                
              </div>
              <div className="list-group list-group-flush">
                {students.length === 0 ? (
                  <div className="text-center text-muted p-4">
                    <p>Chưa có sinh viên nào</p>
                  </div>
                ) : (
                  students.map((student) => (
                    <button
                      key={student.student_id}
                      className={`list-group-item list-group-item-action d-flex align-items-center p-3 border-0 ${
                        selectedStudent?.student_id === student.student_id ? "active" : ""
                      }`}
                      onClick={() => handleSelectStudent(student)}
                    >
                      <img
                        src={student.student_avatar ? `${imageUrl}${student.student_avatar}` : "/default-avatar.png"}
                        alt={student.student_name}
                        className="rounded-circle me-3"
                        style={{ width: 50, height: 50, objectFit: "cover" }}
                      />
                      <div className="flex-grow-1">
                        <h6 className="mb-0">{student.student_name}</h6>
                        <small className="text-muted">{student.student_email}</small>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Khung chat bên phải */}
            <div className="col-md-8 col-lg-9 d-flex flex-column h-100 p-0">
              {selectedStudent ? (
                <>
                  {/* Header chat */}
                  <div className="bg-white border-bottom p-3 d-flex align-items-center shadow-sm">
                    <img
                      src={selectedStudent.student_avatar ? `${imageUrl}${selectedStudent.student_avatar}` : "/default-avatar.png"}
                      alt={selectedStudent.student_name}
                      className="rounded-circle me-3"
                      style={{ width: 45, height: 45, objectFit: "cover" }}
                    />
                    <div>
                      <h6 className="mb-0">{selectedStudent.student_name}</h6>
                      <small className="text-muted">Đang hoạt động</small>
                    </div>
                  </div>

                  {/* Khu vực tin nhắn */}
                  <div className="flex-grow-1 overflow-auto p-3 bg-light">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted mt-5">
                        <p>Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện!</p>
                      </div>
                    ) : (
                      messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`d-flex mb-3 ${msg.sender === "teacher" ? "justify-content-end" : "justify-content-start"}`}
                        >
                          <div
                            className={`p-3 rounded-3 shadow-sm ${
                              msg.sender === "teacher"
                                ? "bg-primary text-white"
                                : "bg-white text-dark"
                            }`}
                            style={{ maxWidth: "70%" }}
                            
                          >
                            <p className="mb-1">{msg.content}</p>
                            {msg.createdAt && (
                              <small className="opacity-75">
                                {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </small>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Ô nhập tin nhắn */}
                  <div className="bg-white border-top p-3">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nhập tin nhắn..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                      />
                      <button className="btn btn-primary" onClick={sendMessage}>
                        <i className="bi bi-send-fill"></i> Gửi
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                  <div className="text-center">
                    <i className="bi bi-chat-dots" style={{ fontSize: "4rem" }}></i>
                    <p className="mt-3">Chọn một sinh viên để bắt đầu trò chuyện</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeacherMessagePage;
