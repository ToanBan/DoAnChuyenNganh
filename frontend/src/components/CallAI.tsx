// src/components/CallAI.tsx
import React, { useState } from "react";

const CallAI = () => {
  const [inputData, setInputData] = useState("");
  const [aiResponse, setAiResponse] = useState<string[]>([]); // Dữ liệu nhiều tin nhắn
  const [isLoading, setIsLoading] = useState(false); // Cờ đang load dữ liệu

  // Hàm gọi API AI
  const callAIModel = async () => {
    if (!inputData.trim()) return; // Kiểm tra nếu không có dữ liệu đầu vào

    setIsLoading(true); // Đánh dấu bắt đầu quá trình gọi API

    try {
      // Gọi API từ AI Studio
      const response = await fetch("https://api.ai-studio.com/v1/predict", {
        method: "POST", // Phương thức POST
        headers: {
          "Content-Type": "application/json",
          "Authorization": `AIzaSyDSl6zpAe9M4fK1RGhGIN0kkC2EFgFfCcU`, // Thay YOUR_API_KEY bằng API key của bạn
        },
        body: JSON.stringify({
          input: inputData,  // Gửi dữ liệu đầu vào
        }),
      });

      // Kiểm tra nếu API gọi thành công
      if (response.ok) {
        const data = await response.json();
        setAiResponse((prevMessages) => [
          ...prevMessages,
          `Bạn: ${inputData}`,
          `Bot: ${data.prediction}`, // Nhận phản hồi từ bot
        ]);
      } else {
        console.error("Lỗi API:", response.statusText);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API", error);
    } finally {
      setIsLoading(false); // Kết thúc quá trình gọi API
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px", width: "300px" }}>
      <div
        style={{
          background: "#6366f1",
          color: "#fff",
          padding: "10px",
          borderRadius: "10px 10px 0 0",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        CourseBase Chatbot 🤖
      </div>

      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "0 0 10px 10px",
          maxHeight: "400px",
          overflowY: "auto",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ marginBottom: "10px", fontSize: "14px", color: "#999" }}>
          {aiResponse.map((msg, index) => (
            <p key={index} style={{ margin: "5px 0" }}>
              <strong>{msg.includes("Bot:") ? "Bot" : "Bạn"}:</strong> {msg}
            </p>
          ))}
        </div>

        <div style={{ display: "flex" }}>
          <input
            type="text"
            placeholder="Nhập tin nhắn của bạn..."
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            style={{
              width: "80%",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          />
          <button
            onClick={callAIModel}
            style={{
              width: "20%",
              padding: "10px",
              backgroundColor: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginLeft: "10px",
            }}
          >
            {isLoading ? "Đang tải..." : "Gửi"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallAI;
