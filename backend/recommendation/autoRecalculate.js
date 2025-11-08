import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ⚙️ Cấu hình đường dẫn chuẩn trong ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseDir = path.join(__dirname, "..", "data");

// 🧠 Hàm tính cosine similarity giữa 2 vector embedding
function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return normA === 0 || normB === 0 ? 0 : dot / (normA * normB);
}

// 1️⃣ Tính similarity giữa nội dung người dùng và forum
const calculationSimilarityContentForum = async () => {
  const forumsPath = path.join(baseDir, "forum_dataset_embeddings.json");
  const contentPath = path.join(baseDir, "content_dataset_embeddings.json");

  console.log("📂 Đọc dữ liệu từ:", contentPath);
  if (!fs.existsSync(forumsPath) || !fs.existsSync(contentPath)) {
    console.warn("⚠️ Thiếu forum hoặc content embeddings!");
    return;
  }

  const forums = JSON.parse(fs.readFileSync(forumsPath, "utf8"));
  const contents = JSON.parse(fs.readFileSync(contentPath, "utf8"));

  // Gom embedding theo user
  const userEmbeddings = {};
  for (const content of contents) {
    if (!userEmbeddings[content.userId]) userEmbeddings[content.userId] = [];
    userEmbeddings[content.userId].push(content.embedding);
  }

  // Trung bình hóa embedding của mỗi user
  const averagedUsers = Object.entries(userEmbeddings).map(
    ([userId, embeddings]) => {
      const dim = embeddings[0].length;
      const avg = Array(dim).fill(0);
      for (const emb of embeddings)
        for (let i = 0; i < dim; i++) avg[i] += emb[i];
      for (let i = 0; i < dim; i++) avg[i] /= embeddings.length;
      return { userId: Number(userId), embedding: avg };
    }
  );

  // Tính similarity giữa user và forum
  const results = [];
  for (const user of averagedUsers) {
    for (const forum of forums) {
      const sim = cosineSimilarity(user.embedding, forum.embedding);
      results.push({
        userId: user.userId,
        forumId: forum.forumId,
        similarity: sim,
      });
    }
  }

  const outputPath = path.join(baseDir, "similarity_content_forum.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf8");
  console.log("Đã tính similarity_content_forum");
};

// 2Tính similarity giữa hành vi người dùng và forum
const calculationSimilarityBehaviorForum = async () => {
  const forumsPath = path.join(baseDir, "forum_dataset_embeddings.json");
  const behaviorPath = path.join(baseDir, "behavior_dataset_embeddings.json");

  if (!fs.existsSync(forumsPath) || !fs.existsSync(behaviorPath)) {
    console.warn("⚠️ Thiếu forum hoặc behavior embeddings!");
    return;
  }

  const forums = JSON.parse(fs.readFileSync(forumsPath, "utf8"));
  const behaviors = JSON.parse(fs.readFileSync(behaviorPath, "utf8"));

  // Gom embedding hành vi theo user
  const userEmbeddings = {};
  for (const behavior of behaviors) {
    if (!userEmbeddings[behavior.userId]) userEmbeddings[behavior.userId] = [];
    userEmbeddings[behavior.userId].push(behavior.embedding);
  }

  const averagedUsers = Object.entries(userEmbeddings).map(
    ([userId, embeddings]) => {
      const dim = embeddings[0].length;
      const avg = Array(dim).fill(0);
      for (const emb of embeddings)
        for (let i = 0; i < dim; i++) avg[i] += emb[i];
      for (let i = 0; i < dim; i++) avg[i] /= embeddings.length;
      return { userId: Number(userId), embedding: avg };
    }
  );

  // Tính similarity
  const results = [];
  for (const user of averagedUsers) {
    for (const forum of forums) {
      const sim = cosineSimilarity(user.embedding, forum.embedding);
      results.push({
        userId: user.userId,
        forumId: forum.forumId,
        similarity: sim,
      });
    }
  }

  const outputPath = path.join(baseDir, "similarity_behavior_forum.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf8");
  console.log("Đã tính similarity_behavior_forum");
};

const finalSimilarity = async () => {
  const alpha = 0.6; // 60% hành vi, 40% nội dung

  const contentSimPath = path.join(baseDir, "similarity_content_forum.json");
  const behaviorSimPath = path.join(baseDir, "similarity_behavior_forum.json");

  if (!fs.existsSync(contentSimPath)) {
    console.warn("Không tìm thấy similarity_content_forum!");
    return;
  }

  const contentSims = JSON.parse(fs.readFileSync(contentSimPath, "utf8"));
  const behaviorSims = fs.existsSync(behaviorSimPath)
    ? JSON.parse(fs.readFileSync(behaviorSimPath, "utf8"))
    : [];

  const behaviorMap = new Map();
  behaviorSims.forEach((b) =>
    behaviorMap.set(`${b.userId}-${b.forumId}`, b.similarity)
  );

  const finalResults = contentSims.map((c) => {
    const key = `${c.userId}-${c.forumId}`;
    const behaviorSim = behaviorMap.get(key) || 0;
    const finalScore = alpha * behaviorSim + (1 - alpha) * c.similarity;
    return { userId: c.userId, forumId: c.forumId, finalScore };
  });

  // Chỉ lấy top 3 forum cho mỗi user
  const userMap = new Map();
  finalResults.forEach((item) => {
    if (!userMap.has(item.userId)) userMap.set(item.userId, []);
    userMap.get(item.userId).push(item);
  });

  const topResults = [];
  userMap.forEach((forums) => {
    forums.sort((a, b) => b.finalScore - a.finalScore);
    forums.slice(0, 3).forEach((f) => topResults.push(f));
  });

  const outputPath = path.join(baseDir, "final_similarity_top3.json");
  fs.writeFileSync(outputPath, JSON.stringify(topResults, null, 2), "utf8");
  console.log("🏁 Đã tạo final_similarity_top3");
};

export const runAutoRecalculate = async () => {
  console.log("Bắt đầu tính toán gợi ý forum...");
  await calculationSimilarityContentForum();
  await calculationSimilarityBehaviorForum();
  await finalSimilarity();
  console.log("Hoàn tất cập nhật gợi ý forum!");
};
