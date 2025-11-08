require("dotenv").config({ path: __dirname + "/../.env" });

const cron = require("node-cron");
const { runAutoRecalculate } = require("./autoRecalculate.js");
const { generateWeeklyForumTopics } = require("../controllers/GetDatasetController.js");
console.log("📂 Working directory:", process.cwd());
console.log("🔑 GOOGLE_GENAI_APIKEY:", process.env.GOOGLE_GENAI_APIKEY || "❌ Không tìm thấy key");

cron.schedule("0 0 * * *", async () => {
  console.log("🕐 Cron: Chạy runAutoRecalculate lúc:", new Date().toISOString());
  try {
    await runAutoRecalculate();
    console.log("✅ Hoàn tất runAutoRecalculate!");
  } catch (e) {
    console.error("❌ Cron lỗi:", e);
  }
});

cron.schedule("0 0 * * *", async () => {
  console.log("🕐 Cron: Bắt đầu sinh chủ đề mới lúc:", new Date().toISOString());
  try {
    await generateWeeklyForumTopics();
    console.log("Đã tạo xong chủ đề mới!");
  } catch (e) {
    console.error("Lỗi khi tạo chủ đề mới:", e);
  }
});

(async () => {
  console.log("Chạy thử sinh chủ đề ngay khi khởi động server...");
  try {
    await generateWeeklyForumTopics();
    console.log("Sinh chủ đề thử thành công!");
  } catch (e) {
    console.error("Lỗi khi test generateWeeklyForumTopics:", e);
  }
})();

// 🔹 (Tuỳ chọn) Kiểm tra tự động tính toán ngay khi start
// (async () => {
//   console.log("🧮 Chạy lần đầu để kiểm tra runAutoRecalculate...");
//   await runAutoRecalculate();
// })();
