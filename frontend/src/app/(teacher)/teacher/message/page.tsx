"use client";
import React, { useEffect, useState, useRef } from "react";
import socket from "@/lib/socket";
import NavigationAdmin_Teacher from "@/app/components/share/NavigationAdmin";
import GetMessages from "@/app/api/GetMessages";
interface Student {
  student_id: string;
  student_avatar: string;
  student_name: string;
  student_email: string;
  student_phone: string;
}

interface MessageProps {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  senderType: string;
  receiverType: string;
}

const imageUrl = "http://localhost:5000/uploads/";

const TeacherMessagePage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [studentId, setStudentId] = useState("");
  const [content, setContent] = useState<string>("");
  const [teacherId, setTeacherId] = useState("");

  useEffect(()=> {
    const data = localStorage.getItem("teacherId");
    if(data){
      setTeacherId(data);
    }
  })

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
          student_id: String(user.id),
          student_name: user.username || "Chưa có tên",
          student_email: user.email || "",
          student_phone: user.phone || "",
          student_avatar: user.avatar || "",
        }));
        setStudents(studentList);
      } catch (err) {
        console.error("Lỗi lấy danh sách sinh viên:", err);
        setStudents([]);
      }
    };
    GetStudents();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setStudentId(student.student_id);
    if(teacherId){
      socket.emit("JoinChat");
    }
  };


  useEffect(()=>{
    if(!studentId) return;
    const fetchMessages = async() => {
      const data = await GetMessages(studentId);
      setMessages(data);
    }
    fetchMessages()
  }, [studentId]);

  const sendMessage = () => {
    const recieveId = studentId;
    if (!recieveId) return;
    if (content.trim() === "") return;
    const data = { recieveId, content };
    socket.emit("sendMessage", data);
    setContent("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    socket.on("receiveMessage", (msg: MessageProps) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  console.log(messages);
  return (
    <>
      <NavigationAdmin_Teacher />
      <div
        className="content"
        style={{ height: "calc(100vh - 80px)", overflow: "hidden" }}
      >
        <div className="container-fluid h-100 p-0">
          <div className="d-flex h-100">
            <div
              className="col-3 p-0 border-end d-flex flex-column"
              style={{ background: "#f8f9fa" }}
            >
              <h5 className="p-3 mb-0 border-bottom text-primary fw-bold">
                👥 Danh sách Sinh viên
              </h5>
              <div className="list-group list-group-flush flex-grow-1 overflow-auto">
                {students.length > 0 ? (
                  students.map((student) => (
                    <div
                      key={student.student_id}
                      className={`list-group-item list-group-item-action py-3 px-3 d-flex align-items-center ${
                        selectedStudent?.student_id === student.student_id
                          ? "active bg-primary text-white border-0"
                          : ""
                      }`}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSelectStudent(student)}
                    >
                      <img
                        src={
                          student.student_avatar
                            ? `${imageUrl}${student.student_avatar}`
                            : "https://img.freepik.com/free-vector/user-circles-set_78370-4704.jpg?semt=ais_hybrid&w=740&q=80"
                        } // Thay đường dẫn avatar mặc định
                        alt={student.student_name}
                        className="rounded-circle me-3"
                        style={{
                          width: "45px",
                          height: "45px",
                          objectFit: "cover",
                        }}
                      />
                      <div className="flex-grow-1">
                        <div
                          className={`fw-bold ${
                            selectedStudent?.student_id === student.student_id
                              ? "text-white"
                              : "text-dark"
                          }`}
                        >
                          {student.student_name}
                        </div>
                        <small
                          className={`${
                            selectedStudent?.student_id === student.student_id
                              ? "text-light"
                              : "text-muted"
                          }`}
                        >
                          {student.student_email}
                        </small>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-muted">
                    Không tìm thấy sinh viên nào.
                  </div>
                )}
              </div>
            </div>

            <div className="col-9 p-0 d-flex flex-column">
              {selectedStudent ? (
                <div className="h-100 w-100 d-flex flex-column">
                  {/* Header Chat */}
                  <div className="p-3 border-bottom d-flex align-items-center bg-white shadow-sm">
                    <img
                      src={
                        selectedStudent.student_avatar
                          ? `${imageUrl}${selectedStudent.student_avatar}`
                          : "https://img.freepik.com/free-vector/user-circles-set_78370-4704.jpg?semt=ais_hybrid&w=740&q=80"
                      }
                      alt={selectedStudent.student_name}
                      className="rounded-circle me-3"
                      style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "cover",
                      }}
                    />
                    <div>
                      <div className="fw-bold">
                        {selectedStudent.student_name}
                      </div>
                      <small className="text-muted">
                        {selectedStudent.student_email}
                      </small>
                    </div>
                  </div>

                  {/* Khu vực Hiển thị Tin nhắn */}
                  <div className="flex-grow-1 p-4 overflow-auto bg-light">
                    {messages.length > 0 ? (
                      messages.map((msg, index) => (
                        <div
                          key={index}
                          className={`d-flex mb-3 ${
                            msg.senderType === "teacher"
                              ? "justify-content-end"
                              : "justify-content-start"
                          }`}
                        >
                          <div
                            className={`p-2 rounded shadow-sm ${
                              msg.senderType === "teacher"
                                ? "bg-primary text-white"
                                : "bg-white border text-dark"
                            }`}
                            style={{ maxWidth: "70%" }}
                          >
                            {msg.content}
                            <div
                              className="text-end"
                              style={{
                                fontSize: "0.7rem",
                                marginTop: "5px",
                                opacity: 0.7,
                              }}
                            >
                              {/* Có thể format lại thời gian nếu cần */}
                              {msg.createdAt
                                ? new Date(msg.createdAt).toLocaleTimeString()
                                : "Vừa gửi"}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                        Hãy gửi tin nhắn đầu tiên cho{" "}
                        {selectedStudent.student_name}.
                      </div>
                    )}
                    <div ref={messagesEndRef} /> {/* Dùng để cuộn xuống cuối */}
                  </div>

                  <div className="p-3 border-top bg-white">
                    <div className="input-group">
                      <textarea
                        className="form-control"
                        placeholder="Nhập tin nhắn..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleKeyPress}
                        rows={1}
                        style={{ resize: "none" }}
                      />
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={sendMessage}
                        disabled={!content.trim()}
                      >
                        <i className="bi bi-send"></i> Gửi
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Màn hình chờ nếu chưa chọn sinh viên
                <div className="d-flex justify-content-center align-items-center h-100 text-muted bg-light">
                  <div className="text-center">
                    <i className="bi bi-chat-dots fs-1 mb-3"></i>
                    <h4>Chào mừng đến với Chatbox</h4>
                    <p>
                      Chọn một sinh viên từ danh sách bên trái để bắt đầu cuộc
                      trò chuyện.
                    </p>
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
