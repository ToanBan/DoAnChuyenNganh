// backend/controllers/WeakTopicsController.js

const path = require("path");
const { spawn } = require("child_process");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const { Topic, Video, Lecture, Question, Notification } = require("../models");
const { GoogleGenAI } = require("@google/genai");

// Khởi tạo client Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_APIKEY,
});

// Hàm bỏ tag HTML của lecture để gửi sang AI cho gọn
const stripHtml = (html = "") => {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
};

/**
 * Hàm helper: Dùng AI sinh câu hỏi MỚI (KHÔNG lưu DB, chỉ trả về mảng JS)
 */
const generateAIQuestionsForTopicRuntime = async (
  topic,
  lectures,
  numQuestions = 5
) => {
  let lectureText = lectures
    .map((l) => stripHtml(l.content_html || ""))
    .join("\n\n");

  // Cắt bớt cho gọn nếu quá dài
  if (lectureText.length > 4000) {
    lectureText = lectureText.slice(0, 4000);
  }

  const prompt = `
Bạn là trợ lý xây dựng câu hỏi trắc nghiệm cho khóa học lập trình / công nghệ.

Nhiệm vụ:
- Đọc hiểu nội dung bài giảng và chủ đề bên dưới.
- TỰ TẠO ra các câu hỏi trắc nghiệm mới, không trùng lặp câu chữ với nội dung gốc.
- Không được sao chép nguyên văn bất kỳ câu hỏi trắc nghiệm nào đã có trong bài giảng.
- Có thể dùng cùng kiến thức, nhưng phải DIỄN ĐẠT LẠI (paraphrase, thay ví dụ, thay số liệu).

Chủ đề: "${topic.topic_name}"
Mô tả: "${topic.topic_description || ""}"

Tóm tắt nội dung bài giảng (có thể bị cắt ngắn):
${lectureText || "[Không có nội dung chi tiết]"}

Yêu cầu tạo CHÍNH XÁC ${numQuestions} câu trắc nghiệm, mỗi câu:
- Có trường "question_text": câu hỏi rõ ràng, dễ hiểu.
- Có 4 lựa chọn A, B, C, D, trường "options": { "A": "...", "B": "...", "C": "...", "D": "..." }.
- Có "correct_answer": 1 trong 4 giá trị "A" | "B" | "C" | "D".
- Có "explanation": giải thích ngắn gọn vì sao đáp án đó đúng.

⚠️ QUAN TRỌNG:
- Câu hỏi PHẢI là câu hỏi MỚI sinh ra, KHÔNG copy nguyên văn nội dung câu hỏi nào có sẵn trong bài.
- Được phép dùng cùng kiến thức nhưng đổi cấu trúc câu, đổi bối cảnh, đổi số liệu minh họa, v.v.

Chỉ trả về JSON THUẦN đúng cấu trúc sau, KHÔNG thêm bất kỳ chữ nào bên ngoài:

{
  "questions": [
    {
      "question_text": "string",
      "options": {
        "A": "string",
        "B": "string",
        "C": "string",
        "D": "string"
      },
      "correct_answer": "A" | "B" | "C" | "D",
      "explanation": "string"
    }
  ]
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-lite",
    contents: prompt,
    temperature: 0.5,
  });

  const text =
    response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
    response?.candidates?.[0]?.output_text ||
    "";

  if (!text) {
    console.warn("AI không trả text cho topic", topic.id);
    return [];
  }

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    console.warn("Không tìm thấy JSON trong output AI cho topic", topic.id);
    return [];
  }

  try {
    const data = JSON.parse(match[0]);
    const questions = Array.isArray(data.questions) ? data.questions : [];
    // Chuẩn hóa đúng format mà frontend weak-topics đang dùng
    return questions.map((q, index) => ({
      id: index + 1, // id tạm trên client
      question_text: q.question_text,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation || "",
    }));
  } catch (err) {
    console.error("Parse JSON AI questions error (topic", topic.id, "):", err);
    return [];
  }
};

/**
 * API chính: Gợi ý CHỦ ĐỀ YẾU + tài nguyên + câu hỏi AI + tạo thông báo chuông
 * GET /api/user/weak_topics
 */
const GetWeakTopicsRecommendation = async (req, res) => {
  try {
    // 1. Lấy userId
    let userId = req.user?.id || req.userId || req.query.userId;

    if (!userId && req.cookies?.token) {
      try {
        const decoded = jwt.verify(
          req.cookies.token,
          process.env.ACCESS_TOKEN
        );
        userId = decoded.id;
      } catch (err) {
        console.error("JWT verify error in WeakTopics:", err);
      }
    }

    if (!userId) {
      return res.status(400).json({
        message:
          "Không tìm thấy userId. Hãy kiểm tra lại VerifyToken hoặc cookie đăng nhập.",
      });
    }

    // 2. Gọi Python model để lấy danh sách weak_topics
    const pythonBin = process.env.PYTHON_BIN || "python";
    const scriptPath = path.join(__dirname, "..", "ml", "gb_predict.py");

    const py = spawn(
      pythonBin,
      [scriptPath, "--mode", "diagnose", "--user", String(userId)],
      { cwd: path.join(__dirname, "..") }
    );

    let output = "";
    let errorOutput = "";

    py.stdout.on("data", (data) => {
      output += data.toString();
    });

    py.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    py.on("close", async (code) => {
      if (code !== 0) {
        console.error("gb_predict.py error:", errorOutput);
        return res.status(500).json({
          message: "Lỗi khi chạy mô hình ML (gb_predict.py).",
          error: errorOutput,
        });
      }

      let parsed;
      try {
        parsed = JSON.parse(output);
      } catch (err) {
        console.error("Parse output error:", err, output);
        return res.status(500).json({
          message: "Không parse được JSON từ output của ML.",
          raw: output,
        });
      }

      const weakTopics = parsed.weak_topics || [];
      if (!weakTopics.length) {
        return res.status(200).json({
          user_id: userId,
          weak_topics: [],
          message:
            "Hiện tại hệ thống không phát hiện chủ đề yếu rõ rệt cho học viên này.",
        });
      }

      // 3. Lấy meta topic + video + lecture
      const topicIds = weakTopics.map((t) => t.topic_id);

      const topics = await Topic.findAll({
        where: { id: { [Op.in]: topicIds } },
      });

      const videos = await Video.findAll({
        where: { topic_id: { [Op.in]: topicIds } },
      });

      const lectures = await Lecture.findAll({
        where: { topic_id: { [Op.in]: topicIds } },
      });

      const topicMap = {};
      topics.forEach((t) => {
        topicMap[t.id] = t;
      });

      const videosByTopic = {};
      videos.forEach((v) => {
        if (!videosByTopic[v.topic_id]) videosByTopic[v.topic_id] = [];
        videosByTopic[v.topic_id].push({
          id: v.id,
          title: v.video_title,
          url: `http://localhost:5000/uploads/${v.video_url}`,
          createdAt: v.createdAt,
        });
      });

      const lecturesByTopic = {};
      lectures.forEach((l) => {
        if (!lecturesByTopic[l.topic_id]) lecturesByTopic[l.topic_id] = [];
        lecturesByTopic[l.topic_id].push(l);
      });

      // 4. Dùng AI sinh câu hỏi cho từng topic yếu (KHÔNG lưu DB)
      const responseWeakTopics = [];
      for (const wt of weakTopics) {
        const topic = topicMap[wt.topic_id];
        if (!topic) continue;

        const lectureList = lecturesByTopic[wt.topic_id] || [];
        const aiQuestions = await generateAIQuestionsForTopicRuntime(
          topic,
          lectureList,
          5 // số câu bạn muốn mỗi topic
        );

        responseWeakTopics.push({
          topic_id: wt.topic_id,
          topic_name: topic.topic_name,
          topic_description: topic.topic_description,
          course_id: topic.course_id,

          prob_weak: wt.prob_weak,
          accuracy: wt.accuracy,
          score: wt.score,
          correct_count: wt.correct_count,
          total_questions: wt.total_questions,
          attempt_number: wt.attempt_number,

          resources: {
            videos: videosByTopic[wt.topic_id] || [],
            lectures: (lecturesByTopic[wt.topic_id] || []).map((l) => ({
              id: l.id,
              name: l.name_lecture,
              file_path: `http://localhost:5000/uploads/${l.file_path}`,
              createdAt: l.createdAt,
            })),
            // CHỈ AI – KHÔNG DÙNG CÂU HỎI GỐC CỦA KHÓA HỌC
            extra_questions: aiQuestions,
          },
        });
      }

      // 5. TẠO THÔNG BÁO CHO CHUÔNG 🔔 (type = "weak_topic")
      try {
        for (const wt of weakTopics) {
          const topic = topicMap[wt.topic_id];
          const topicName = topic
            ? topic.topic_name
            : `Chủ đề #${wt.topic_id}`;

          await Notification.findOrCreate({
            where: {
              receiver_id: userId,
              type: "weak_topic",
              message: {
                [Op.like]: `%${topicName}%`,
              },
            },
            defaults: {
              sender_id: null, // có thể đặt id user "system" nếu sau này bạn muốn
              receiver_id: userId,
              type: "weak_topic",
              message: `Hệ thống phát hiện bạn đang yếu ở chủ đề "${topicName}". Nhấn để xem gợi ý học tập.`,
              is_read: false,
            },
          });
        }
      } catch (notifyErr) {
        console.error("Create weak_topic notification error:", notifyErr);
        // Không throw để tránh làm hỏng response chính
      }

      // 6. Trả kết quả chính cho frontend
      return res.status(200).json({
        user_id: userId,
        weak_topics: responseWeakTopics,
      });
    });
  } catch (error) {
    console.error("GetWeakTopicsRecommendation error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  GetWeakTopicsRecommendation,
};
