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

interface Course {
  id: number;
  course_name: string;
}

interface ChatRoom {
  id: number;
  student: {
    id: number;
    username: string;
    email?: string;
    phone?: string;
    avatar?: string | null;
  };
  course?: Course | null;
}

const imageUrl = "http://localhost:5000/uploads/";

const TeacherMessagePage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [chatroomId, setChatroomId] = useState<number | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const normalize = (data: any[]) =>
      data.map((r: any) => ({
        id: r.id,
        student: {
          id: r.student?.id ?? r.user?.id ?? r.student_id,
          username:
            r.student?.username ??
            r.user?.username ??
            r.student_name ??
            "",
          email: r.student?.email ?? r.user?.email ?? "",
          phone: r.student?.phone ?? r.user?.phone ?? "",
          avatar: r.student?.avatar ?? r.user?.avatar ?? "",
        },
        course: r.course
          ? { id: r.course.id, course_name: r.course.course_name || r.course.name }
          : r.course_id
          ? { id: r.course_id, course_name: r.course_name || "" }
          : null,
      }));

    const tryFetch = async (url: string) => {
      try {
        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          const text = await res.text();
          console.error("GetRooms non-OK response:", res.status, text);
          return null;
        }
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          const text = await res.text();
          console.error("GetRooms expected JSON but got:", text);
          return null;
        }
        const data = await res.json();
        const list: any[] = Array.isArray(data.rooms)
          ? data.rooms
          : Array.isArray(data.message)
          ? data.message
          : Array.isArray(data)
          ? data
          : [];
        return normalize(list);
      } catch (err) {
        console.error("GetRooms fetch error:", err);
        return null;
      }
    };

    const GetStudents = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/teacher_students", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          console.error("GetStudents non-OK:", res.status);
          setStudents([]);
          return;
        }
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

    const GetRooms = async () => {
      let roomsData = await tryFetch("http://localhost:5000/api/teacher_chatrooms");
      if (roomsData && roomsData.length) {
        setRooms(roomsData);
        return;
      }

      const getTokenFromCookie = () => {
        const m = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
        return m ? decodeURIComponent(m[1]) : null;
      };
      const parseJwt = (token: string | null) => {
        if (!token) return null;
        try {
          const parts = token.split(".");
          if (parts.length < 2) return null;
          const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
          const json = decodeURIComponent(
            atob(payload)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          );
          return JSON.parse(json);
        } catch (e) {
          return null;
        }
      };
      const token = getTokenFromCookie();
      const payload = parseJwt(token);
      const teacherId = payload?.id ?? payload?.userId ?? null;

      if (teacherId) {
        roomsData = await tryFetch(`http://localhost:5000/api/teacher_chatrooms?teacherId=${teacherId}`);
        if (roomsData && roomsData.length) {
          setRooms(roomsData);
          return;
        }
      }

      roomsData = await tryFetch(`http://localhost:5000/api/_debug_teacher_chatrooms?teacherId=${teacherId || 0}`);
      if (roomsData) {
        setRooms(roomsData);
        return;
      }

      setRooms([]);
    };

    GetStudents();
    GetRooms();

    const getTokenFromCookie = () => {
      const m = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
      return m ? decodeURIComponent(m[1]) : null;
    };
    const parseJwt = (token: string | null) => {
      if (!token) return null;
      try {
        const parts = token.split(".");
        if (parts.length < 2) return null;
        const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
          atob(payload)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        return JSON.parse(json);
      } catch (e) {
        return null;
      }
    };

    const token = getTokenFromCookie();
    const payload = parseJwt(token);
    if (payload?.id) setMyUserId(Number(payload.id));

    const handleReceive = (msg: Message) => {
      setMessages((prev) => {
        if (msg.id && prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };
    socket.on("receiveChatMessage", handleReceive);
    return () => {
      socket.off("receiveChatMessage", handleReceive);
    };
  }, []);

  useEffect(() => {
    const handleChatError = (err: any) => {
      console.error("chat_error payload (server):", err);
    };
    socket.on("chat_error", handleChatError);
    return () => {
      socket.off("chat_error", handleChatError);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setMessages([]);
    const roomId = parseInt(student.student_id, 10);
    setChatroomId(roomId);
    socket.emit("joinChatRoom", roomId);
  };

  const handleSelectRoom = (room: ChatRoom) => {
    const student: Student = {
      student_id: String(room.student.id),
      student_avatar: room.student.avatar || "",
      student_name: room.student.username || "Chưa có tên",
      student_email: room.student.email || "",
      student_phone: room.student.phone || "",
    };
    setSelectedStudent(student);
    setSelectedCourse(room.course ?? null);
    setMessages([]);
    setChatroomId(room.id);
    socket.emit("joinChatRoom", room.id);
  };

  const sendMessage = () => {
    if (!input.trim() || !chatroomId) return;
    const msg = { roomId: chatroomId, content: input };
    socket.emit("sendChatMessage", msg);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
            <div className="col-md-4 col-lg-3 border-end bg-light h-100 overflow-auto p-0">
              <div className="p-3 sticky-top" style={{ background: "linear-gradient(135deg, #007bff, #0056b3)" }}>
                <h5 className="mb-0 text-dark">💬 Danh sách sinh viên</h5>
              </div>
              <div className="list-group list-group-flush">
                {rooms.length === 0 ? (
                  <div className="text-center text-muted p-4">
                    <p>Chưa có sinh viên nào</p>
                  </div>
                ) : (
                  <>
                    {rooms.map((room) => (
                      <button
                        key={room.id}
                        className={`list-group-item list-group-item-action d-flex align-items-center p-3 border-0 ${
                          selectedStudent?.student_id === String(room.student.id) ? "active" : ""
                        }`}
                        onClick={() => handleSelectRoom(room)}
                      >
                        <img
                          src={room.student.avatar ? `${imageUrl}${room.student.avatar}` : "/default-avatar.png"}
                          alt={room.student.username}
                          className="rounded-circle me-3"
                          style={{ width: 50, height: 50, objectFit: "cover" }}
                        />
                        <div className="flex-grow-1">
                          <h6 className="mb-0">{room.student.username}</h6>
                          <small className="text-muted">{room.student.email || "Đang hoạt động"}</small>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>

            <div className="col-md-8 col-lg-9 d-flex flex-column h-100 p-0">
              {selectedStudent ? (
                <>
                  <div className="bg-white border-bottom p-3 d-flex align-items-center shadow-sm">
                    <img
                      src={selectedStudent?.student_avatar ? `${imageUrl}${selectedStudent.student_avatar}` : "/default-avatar.png"}
                      alt={selectedStudent?.student_name}
                      className="rounded-circle me-3"
                      style={{ width: 45, height: 45, objectFit: "cover" }}
                    />
                    <div>
                      <h6 className="mb-0">{selectedStudent?.student_name}</h6>
                      <small className="text-muted">{selectedStudent?.student_email || "Đang hoạt động"}</small>
                    </div>
                  </div>

                  <div className="flex-grow-1 overflow-auto p-3 bg-light">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted mt-5">
                        <p>Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện!</p>
                      </div>
                    ) : (
                      messages.map((msg, idx) => {
                        const senderId = (msg as any).senderId ?? (msg as any).sender_id ?? null;
                        const isMine = senderId ? Number(senderId) === myUserId : (msg.sender === "teacher");
                        return (
                          <div
                            key={idx}
                            className={`d-flex mb-3 ${isMine ? "justify-content-end" : "justify-content-start"}`}
                          >
                            <div
                              className={`p-3 rounded-3 shadow-sm ${isMine ? "bg-primary text-white" : "bg-white text-dark"}`}
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
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="bg-white border-top p-3">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nhập tin nhắn..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                      <button className="btn btn-primary ms-2" onClick={sendMessage} type="button">
                        Gửi
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeacherMessagePage;
