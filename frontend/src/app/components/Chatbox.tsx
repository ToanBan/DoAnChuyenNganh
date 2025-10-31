// src/components/Chatbox.tsx
"use client";

import React, { useEffect, useState } from "react";

const PRIMARY_COLOR = "#007bff";
const PRIMARY_COLOR_HOVER = "#0056b3";
const BOT_BACKGROUND = "#e9ecef";
const ICON_SIZE = 28;

// Bỏ mọi dấu *
const cleanText = (s: string) => s.replace(/\*/g, "");

const Chatbox: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Hover UI
  const [isIconHovered, setIsIconHovered] = useState<boolean>(false);
  const [isButtonHovered, setIsButtonHovered] = useState<boolean>(false);

  // Typing indicator
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [dotCount, setDotCount] = useState<number>(0);

  useEffect(() => {
    if (!isTyping) {
      setDotCount(0);
      return;
    }
    const id = setInterval(() => {
      setDotCount((d) => (d + 1) % 4); // 0..3
    }, 400);
    return () => clearInterval(id);
  }, [isTyping]);

  const toggleChatbox = () => setIsOpen((o) => !o);

  const createchatbot = async () => {
    const prompt = input.trim();
    if (!prompt) return;

    // Đẩy tin nhắn người dùng
    const userMessage = cleanText(prompt);
    setMessages((prev) => [...prev, `user:${userMessage}`]);
    setInput("");

    // Bắt đầu hiệu ứng "đang soạn"
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:5000/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      const botMsg = cleanText(String(data?.message ?? ""));
      setMessages((prev) => [...prev, `bot:${botMsg}`]);
    } catch (e) {
      console.error("Error in createchatbot:", e);
      setMessages((prev) => [
        ...prev,
        "bot:Đã có lỗi kết nối máy chủ. Vui lòng thử lại.",
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Hiển thị 1 tin nhắn
  const renderMessage = (msg: string, index: number) => {
    const isBot = msg.startsWith("bot:");
    const content = isBot ? msg.slice(4) : msg.slice(5);
    const displayText = cleanText(content);

    return (
      <div
        key={index}
        style={{
          display: "flex",
          justifyContent: isBot ? "flex-start" : "flex-end",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            maxWidth: "75%",
            padding: "8px 12px",
            borderRadius: "15px",
            color: isBot ? "#000" : "#fff",
            backgroundColor: isBot ? BOT_BACKGROUND : PRIMARY_COLOR,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            wordWrap: "break-word",
            whiteSpace: "pre-wrap",
          }}
        >
          {displayText}
        </div>
      </div>
    );
  };

  // Bubble "bot đang soạn…"
  const renderTyping = () => {
    if (!isTyping) return null;
    const dots = ".".repeat(dotCount);
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            maxWidth: "60%",
            padding: "8px 12px",
            borderRadius: "15px",
            color: "#000",
            backgroundColor: BOT_BACKGROUND,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            fontStyle: "italic",
            opacity: 0.9,
          }}
        >
          Đang soạn{dots}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Icon Chatbox */}
      <div
        onClick={toggleChatbox}
        onMouseEnter={() => setIsIconHovered(true)}
        onMouseLeave={() => setIsIconHovered(false)}
        title={isOpen ? "Đóng Chat" : "Mở Chat"}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          background: PRIMARY_COLOR,
          color: "#fff",
          borderRadius: "50%",
          padding: "18px",
          cursor: "pointer",
          boxShadow: "0 6px 12px rgba(0, 0, 0, 0.3)",
          zIndex: 1000,
          transition: "transform 0.2s ease-in-out",
          transform: isIconHovered ? "scale(1.05)" : "scale(1)",
        }}
      >
        <span role="img" aria-label="chat" style={{ fontSize: `${ICON_SIZE}px` }}>
          {isOpen ? "✖️" : "💬"}
        </span>
      </div>

      {/* Khung Chat Chính */}
      {isOpen && (
        <div
          className="chatbox-container"
          style={{
            position: "fixed",
            bottom: "100px",
            right: "30px",
            width: "350px",
            height: "450px",
            display: "flex",
            flexDirection: "column",
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            zIndex: 999,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "15px",
              background: PRIMARY_COLOR,
              color: "#fff",
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
              fontSize: "18px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            CourseBase 🤖
          </div>

          {/* Khu vực Tin nhắn */}
          <div
            className="messages-container"
            style={{
              flexGrow: 1,
              padding: "20px",
              overflowY: "auto",
              backgroundColor: "#f8f9fa",
            }}
          >
            {messages.map(renderMessage)}
            {renderTyping()}
          </div>

          {/* Khu vực Input */}
          <div
            className="input-container"
            style={{
              display: "flex",
              borderTop: `1px solid ${BOT_BACKGROUND}`,
              padding: "10px",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isTyping) createchatbot();
              }}
              style={{
                flexGrow: 1,
                padding: "12px",
                borderRadius: "25px",
                border: "1px solid #ccc",
                marginRight: "10px",
                fontSize: "16px",
                outline: "none",
                transition: "border-color 0.2s",
                opacity: isTyping ? 0.85 : 1,
              }}
              placeholder="Nhập tin nhắn của bạn..."
              disabled={isTyping}
            />
            <button
              onClick={createchatbot}
              disabled={isTyping}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
              style={{
                padding: "10px 15px",
                background: isButtonHovered ? PRIMARY_COLOR_HOVER : PRIMARY_COLOR,
                color: "#fff",
                borderRadius: "25px",
                border: "none",
                cursor: isTyping ? "not-allowed" : "pointer",
                fontWeight: "bold",
                minWidth: "70px",
                transition: "background-color 0.2s, opacity 0.2s",
                opacity: isTyping ? 0.8 : 1,
              }}
            >
              {isTyping ? "..." : "Gửi"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbox;
