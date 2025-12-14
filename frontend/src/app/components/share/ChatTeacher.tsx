"use client";

import React, { useState, useEffect } from "react";
import socket from "@/lib/socket";
import GetMessages from "@/app/api/GetMessages";
interface ChatTeacherProps {
  teacherId: string;
  courseId: string;
}

interface MessageProps {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  senderType:string;
  receiverType:string
}

const PRIMARY_GRADIENT = "linear-gradient(135deg, #ff7b00, #ffb703)";
const BOT_BACKGROUND = "#fff4d6";
const USER_BACKGROUND = "#ff7b00";
const ICON_SIZE = 28;

const cleanText = (s: string) => s.replace(/\*/g, "");

const ChatTeacher: React.FC<ChatTeacherProps> = ({ teacherId }) => {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [content, setContent] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [userId, setUserId] = useState("");
  useEffect(()=>{
    const data = localStorage.getItem("userId");
    if(data){
      setUserId(data);
    }
  })

  useEffect(() => {
    if (isOpen && teacherId) {
      if(userId){
        socket.emit("JoinChat");
      }
    }
  }, [isOpen, teacherId]);

  const sendMessage = () => {
    const recieveId = teacherId;
    if (!recieveId) return;
    if (content.trim() === "") return;
    const data = { recieveId, content };
    socket.emit("sendMessage", data);
    setContent("");
  };


  useEffect(()=>{
    if(!teacherId) return;
    const fetchMessages = async() => {
      const data = await GetMessages(teacherId);
      setMessages(data);
    }
    fetchMessages()
  }, [teacherId]);

  useEffect(() => {
    socket.on("receiveMessage", (msg: MessageProps) => {
      setMessages((prev) => [...prev, msg]);
      console.log(msg);
    });
    return () => {
      socket.off("receiveMessage");
    };
  }, []);


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
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  marginBottom: "12px",
                  textAlign: msg.senderType === "student" ? "right" : "left",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    padding: "10px 14px",
                    borderRadius: "18px",
                    backgroundColor:
                      msg.senderId === "user"
                        ? USER_BACKGROUND
                        : BOT_BACKGROUND,
                    color: msg.senderId === "user" ? "#fff" : "#333",
                    maxWidth: "70%",
                    wordWrap: "break-word",
                  }}
                >
                  {cleanText(msg.content)}
                </div>
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
              value={content}
              onChange={(e) => setContent(e.target.value)}
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
