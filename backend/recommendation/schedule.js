require("dotenv").config({ path: __dirname + "/../.env" });

const cron = require("node-cron");
const { runAutoRecalculate } = require("./autoRecalculate.js");
const {
  generateWeeklyForumTopics,
  trainQuizModelInBackground,
  GetWeakTopicsRecommendation,
} = require("../controllers/GetDatasetController.js");
console.log("Working directory:", process.cwd());

console.log(
  "GOOGLE_GENAI_APIKEY:",
  process.env.GOOGLE_GENAI_APIKEY || "Không tìm thấy key"
);

// cron.schedule("* * * * *", async () => {
//   console.log("Cron: Chạy runAutoRecalculate lúc:", new Date().toISOString());
//   try {
//     await runAutoRecalculate();
//     console.log("Hoàn tất runAutoRecalculate!");
//   } catch (e) {
//     console.error("Cron lỗi:", e);
//   }
// });

// cron.schedule("0 0 * * *", async () => {
//   console.log("Cron: Bắt đầu sinh chủ đề mới lúc:", new Date().toISOString());
//   try {
//     await generateWeeklyForumTopics();
//     console.log("Đã tạo xong chủ đề mới!");
//   } catch (e) {
//     console.error("Lỗi khi tạo chủ đề mới:", e);
//   }
// });

// cron.schedule("* * * * *", async () => {
//   console.log("Cron: Gợi Ý Chủ Đề Yếu:", new Date().toISOString());
//   try {
//     await GetWeakTopicsRecommendation;
//     console.log("Gợi Ý Chủ Đề Yếu");
//   } catch (e) {
//     console.error("Lỗi khi Gợi Ý:", e);
//   }
// });

(async () => {
  console.log("Cron: train:", new Date().toISOString());
  try {
    await runAutoRecalculate()
    console.log("finished");
  } catch (e) {
    console.error("Lỗi khi tạo chủ đề mới:", e);
  }
})();
