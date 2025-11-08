"use client";

import React, { useEffect, useState } from "react";

const PRIMARY_GRADIENT = "linear-gradient(135deg, #7b2cbf, #4cc9f0)";
const PRIMARY_COLOR = "#7b2cbf";
const PRIMARY_COLOR_HOVER = "#5a189a";
const BOT_BACKGROUND = "#f3e8ff";
const USER_BACKGROUND = "#7b2cbf";
const ICON_SIZE = 28;

const cleanText = (s: string) => s.replace(/\*/g, "");

const Chatbox: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [dotCount, setDotCount] = useState<number>(0);

  const toggleChatbox = () => setIsOpen((o) => !o);

  useEffect(() => {
    if (!isTyping) {
      setDotCount(0);
      return;
    }
    const id = setInterval(() => setDotCount((d) => (d + 1) % 4), 400);
    return () => clearInterval(id);
  }, [isTyping]);

  const createchatbot = async () => {
    const prompt = input.trim();
    if (!prompt) return;

    const userMessage = cleanText(prompt);
    setMessages((prev) => [...prev, `user:${userMessage}`]);
    setInput("");
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
    } catch {
      setMessages((prev) => [
        ...prev,
        "bot:⚠️ Đã có lỗi kết nối máy chủ. Vui lòng thử lại.",
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = (msg: string, i: number) => {
    const isBot = msg.startsWith("bot:");
    const content = cleanText(isBot ? msg.slice(4) : msg.slice(5));

    return (
      <div
        key={i}
        style={{
          display: "flex",
          justifyContent: isBot ? "flex-start" : "flex-end",
          alignItems: "flex-end",
          marginBottom: "10px",
        }}
      >
        {isBot && (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: PRIMARY_GRADIENT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: "bold",
              marginRight: 8,
              fontSize: 14,
            }}
          >
            🤖
          </div>
        )}
        <div
          style={{
            maxWidth: "75%",
            padding: "10px 14px",
            borderRadius: "18px",
            color: isBot ? "#222" : "#fff",
            background: isBot ? BOT_BACKGROUND : USER_BACKGROUND,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            wordWrap: "break-word",
            whiteSpace: "pre-wrap",
            fontSize: 15,
            lineHeight: 1.4,
            transition: "all 0.3s ease",
          }}
        >
          {content}
        </div>
        {!isBot && (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#dee2e6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#000",
              marginLeft: 8,
              fontSize: 14,
              fontWeight: "bold",
            }}
          >
            👤
          </div>
        )}
      </div>
    );
  };

  const renderTyping = () =>
    isTyping ? (
      <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: PRIMARY_GRADIENT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: "bold",
            marginRight: 8,
          }}
        >
          🤖
        </div>
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "18px",
            background: BOT_BACKGROUND,
            color: "#333",
            fontStyle: "italic",
            opacity: 0.8,
          }}
        >
          Đang soạn{".".repeat(dotCount)}
        </div>
      </div>
    ) : null;

  return (
    <>
      {/* Nút mở chat */}
      <div
        onClick={toggleChatbox}
        title={isOpen ? "Đóng Chat" : "Mở Chat"}
        style={{
          position: "fixed",
          bottom: "30px",
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
            animation: "fadeIn 0.3s ease, slideUp 0.3s ease",
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
            CourseBase Assistant 🤖
          </div>

          {/* Messages */}
          <div
            style={{
              flexGrow: 1,
              padding: "20px",
              overflowY: "auto",
              backgroundColor: "#fafafa",
              scrollBehavior: "smooth",
            }}
          >
            {messages.map(renderMessage)}
            {renderTyping()}
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
              onKeyDown={(e) => e.key === "Enter" && !isTyping && createchatbot()}
              placeholder="Nhập tin nhắn của bạn..."
              disabled={isTyping}
              style={{
                flexGrow: 1,
                padding: "12px 16px",
                borderRadius: "25px",
                border: "1px solid #ccc",
                outline: "none",
                fontSize: "15px",
                marginRight: "10px",
                transition: "all 0.2s",
                backgroundColor:"white",
                color:"#333"
              }}
            />
            <button
              onClick={createchatbot}
              disabled={isTyping}
              style={{
                background: PRIMARY_GRADIENT,
                border: "none",
                borderRadius: "25px",
                color: "#fff",
                padding: "10px 18px",
                fontWeight: "bold",
                cursor: isTyping ? "not-allowed" : "pointer",
                transition: "opacity 0.3s ease",
                opacity: isTyping ? 0.6 : 1,
              }}
            >
              {isTyping ? "..." : "Gửi"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbox;
