"use client";

import React, { useEffect, useState } from "react";
import socket from "@/lib/socket";

interface ChatTeacherProps {
  teacherId: string;
  courseId: string;
}

interface Message {
  id?: number;
  roomId: number;
  sender: "user" | "teacher";
  content: string;
  createdAt?: string;
}
const PRIMARY_GRADIENT = "linear-gradient(135deg, #ff7b00, #ffb703)";
const PRIMARY_COLOR = "#ff7b00";
const PRIMARY_COLOR_HOVER = "#e66a00";
const BOT_BACKGROUND = "#fff4d6";
const USER_BACKGROUND = "#ff7b00";
const ICON_SIZE = 28;

const cleanText = (s: string) => s.replace(/\*/g, "");


const ChatTeacher: React.FC<ChatTeacherProps>= ({ teacherId, courseId }) => {
  const [chatroomId, setChatroomId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [dotCount, setDotCount] = useState<number>(0);
  

  useEffect(() => {
    if (!teacherId || !courseId) {
      console.warn("⚠️ Thiếu teacherId hoặc courseId");
      return;
    }

    console.log("🔌 Init chat với teacher:", teacherId, "course:", courseId);

    // Named handler functions
    const handleRoomJoined = (roomId: number) => {
      console.log("✅ Room ID nhận được:", roomId);
      setChatroomId(roomId);
      socket.emit("joinChatRoom", roomId);
    };

    const handleNewMessage = (msg: Message) => {
      console.log("📩 Nhận tin nhắn:", msg);
      setMessages((prev) => [...prev, msg]);
    };

    const handleChatError = (error: any) => {
      console.error("❌ Lỗi chat:", error);
    };

    // Register listeners
    socket.on("initChatTeacherCallback", handleRoomJoined);
    socket.on("receiveChatMessage", handleNewMessage);
    socket.on("chat_error", handleChatError);

    // Emit init
    socket.emit("initChatTeacher", { teacherId, courseId });

    // Cleanup
    return () => {
      console.log("🧹 Cleanup socket listeners");
      socket.off("initChatTeacherCallback", handleRoomJoined);
      socket.off("receiveChatMessage", handleNewMessage);
      socket.off("chat_error", handleChatError);
      if (chatroomId) {
        socket.emit("leaveChatRoom", chatroomId);
      }
    };
  }, [teacherId, courseId]); // ⚠️ Không thêm chatroomId vào đây


  const sendMessage = () => {
    if (!input.trim() || !chatroomId) return;
    const msg: Message = { roomId: chatroomId, sender: "user", content: input };
    socket.emit("sendChatMessage", msg);
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  return (
  <>
    <div
      onClick={() => setIsOpen(!isOpen)}
      title={isOpen ? "Đóng Chat" : "Mở Chat"}
      style={{
        position: "fixed",
        bottom: "150px",
        right: "30px",
        background: PRIMARY_GRADIENT,
        color: "#fff",
        borderRadius: "50%",
        padding: "18px",
        cursor: "pointer",
        boxShadow: "0 8px 18px rgba(0,0,0,0.25)",
        transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
        transition: "transform 0.3s ease",
        zIndex: 1000,
      }}
    >
      <span style={{ fontSize: ICON_SIZE }}>{isOpen ? "✖️" : "💬"}</span>
    </div>

    {/* Chat window */}
    {isOpen && (
      <div
        style={{
          position: "fixed",
          bottom: "100px",
          right: "30px",
          width: "370px",
          height: "520px",
          display: "flex",
          flexDirection: "column",
          background: "#fff",
          borderRadius: "20px",
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          zIndex: 999,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px",
            background: PRIMARY_GRADIENT,
            color: "#fff",
            fontSize: "18px",
            fontWeight: "bold",
            textAlign: "center",
            letterSpacing: "0.5px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          Chat với giáo viên 👨‍🏫
        </div>

        {/* Messages */}
        <div
          style={{
            flexGrow: 1,
            padding: "20px",
            overflowY: "auto",
            backgroundColor: "#fafafa",
          }}
        >
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                textAlign: m.sender === "user" ? "right" : "left",
                margin: "4px 0",
              }}
            >
              <span
                style={{
                  background: m.sender === "user" ? USER_BACKGROUND : BOT_BACKGROUND,
                  color: m.sender === "user" ? "#fff" : "#000",
                  padding: "6px 10px",
                  borderRadius: 12,
                  display: "inline-block",
                  maxWidth: "80%",
                  wordWrap: "break-word",
                }}
              >
                {m.content}
              </span>
            </div>
          ))}
        </div>

        {/* Input */}
        <div
          style={{
            display: "flex",
            padding: "12px",
            borderTop: "1px solid #eee",
            backgroundColor: "#fff",
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Nhập tin nhắn..."
            style={{
              flexGrow: 1,
              padding: "12px 16px",
              borderRadius: "25px",
              border: "1px solid #ccc",
              outline: "none",
              fontSize: "15px",
              marginRight: "10px",
              backgroundColor: "#fff",
              color: "#333",
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              background: PRIMARY_GRADIENT,
              border: "none",
              borderRadius: "25px",
              color: "#fff",
              padding: "10px 18px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Gửi
          </button>
        </div>
      </div>
    )}
  </>
);
};

export default ChatTeacher;
