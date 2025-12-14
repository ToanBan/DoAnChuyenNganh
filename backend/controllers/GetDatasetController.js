const fs = require("fs");
const path = require("path");
const dayjs = require("dayjs");
const contentDataset = require("../data/full_forums_dataset_large.json");
const {
  Post,
  InvoiceItem,
  UserTopicProgress,
  Topic,
  PostReaction,
  CommentPost,
  Forum,
  ForumTopic,
  Questionnaire,
  QuizAnswer,
  QuizResult,
  TopicWeak,
  Lecture,
  Video,
  QuestionTopicWeak,
  Course,
} = require("../models");
const { where } = require("sequelize");
const { GoogleGenAI } = require("@google/genai");
const jwt = require("jsonwebtoken");
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_APIKEY });
const { spawn } = require("child_process");
const GetContentDataset = async () => {
  try {
    const dataDir = path.join(__dirname, "../data");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

    const filePath = path.join(dataDir, "content_dataset.json");
    if (fs.existsSync(filePath)) {
      console.log("content_dataset.json đã tồn tại, bỏ qua import.");
      return;
    }
    const posts = await Post.findAll({
      attributes: ["id", "userId", "post_caption", "createdAt"],
      include: [
        {
          model: PostReaction,
          as: "reactions",
          attributes: ["userId"],
        },
        {
          model: CommentPost,
          as: "comments",
          attributes: ["id", "userId", "content", "createdAt", "parentId"],
        },
      ],
    });

    const dataset = posts.map((post) => {
      const reactionUsers = post.reactions?.map((r) => r.userId) || [];
      const comments = post.comments || [];
      const replyMap = {};
      comments.forEach((c) => {
        if (c.parentId) {
          replyMap[c.parentId] = (replyMap[c.parentId] || 0) + 1;
        }
      });
      const topComment = comments
        .filter((c) => !c.parentId)
        .sort((a, b) => (replyMap[b.id] || 0) - (replyMap[a.id] || 0))[0];
      return {
        id: post.id,
        userId: post.userId,
        caption: post.post_caption,
        createdAt: post.createdAt,
        countReactionPost: reactionUsers.length,
        countCommentPost: comments.length,
        top_comment: topComment
          ? {
              userId: topComment.userId,
              content: topComment.content,
              createdAt: topComment.createdAt,
              replyCount: replyMap[topComment.id] || 0,
            }
          : null,
      };
    });

    fs.writeFileSync(filePath, JSON.stringify(dataset, null, 2), "utf8");
    console.log(`Import thành công ${dataset.length} bài post -> ${filePath}`);
  } catch (error) {
    console.error("❌ Lỗi GetContentDataset:", error);
  }
};

const GetBehaviorUser = async () => {
  try {
    const dataDir = path.join(__dirname, "../data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    const filePath = path.join(dataDir, "behavior_dataset.json");

    if (fs.existsSync(filePath)) {
      console.log("behavior_dataset.json đã tồn tại, bỏ qua import.");
      return;
    }

    // ⭐ LẤY CẢ COURSE NAME
    const invoiceItems = await InvoiceItem.findAll({
      attributes: ["id", "invoice_id", "course_id", "createdAt"],
      include: [
        { association: "Invoice", attributes: ["user_id"] },
        { association: "Course", attributes: ["course_name"] }, // ← thêm courseName
      ],
    });

    const dataset = await Promise.all(
      invoiceItems.map(async (item) => {
        const userId = item.Invoice.user_id;
        const courseId = item.course_id;
        const courseName = item.Course.course_name; // 🎯 Lấy tên khóa học

        const countTopicOfCourse = await Topic.count({
          where: { course_id: courseId },
        });

        const topics = await Topic.findAll({
          where: { course_id: courseId },
          attributes: ["id"],
        });

        const topicIds = topics.map((t) => t.id);

        const userProgress = await UserTopicProgress.findAll({
          where: { user_id: userId },
          attributes: ["topic_id"],
        });

        const userTopicIds = userProgress.map((up) => up.topic_id);

        const countLearnedTopic = topicIds.filter((id) =>
          userTopicIds.includes(id)
        ).length;

        const percentProgress =
          countTopicOfCourse > 0
            ? (countLearnedTopic / countTopicOfCourse) * 100
            : 0;

        return {
          userId,
          courseId,
          courseName, // ⭐ THÊM VÀO JSON
          percentProgress,
          startDate: item.createdAt,
        };
      })
    );

    fs.writeFileSync(filePath, JSON.stringify(dataset, null, 2), "utf8");
    console.log(
      `Export behavior_dataset.json thành công (${dataset.length} dòng)`
    );
  } catch (error) {
    console.error("Lỗi khi export behavior_dataset:", error);
  }
};

const cleanContentDatasetWithLLM = async () => {
  const filePath = path.join(__dirname, "..", "data", "content_dataset.json");
  const rawData = fs.readFileSync(filePath, "utf-8");
  const dataset = JSON.parse(rawData);
  const cleanedData = [];
  const batchSize = 50;
  for (let i = 0; i < dataset.length; i += batchSize) {
    const batch = dataset.slice(i, i + batchSize);
    console.log(`🚀 Đang xử lý batch ${i / batchSize + 1}`);
    const aiResult = await extractKeywordsLLM(
      batch.map((item) => ({ id: item.id, caption: item.caption }))
    );
    for (const item of batch) {
      const found = aiResult.find((r) => r.id == item.id);
      cleanedData.push({
        id: item.id,
        userId: item.userId,
        caption: item.caption,
        countReactionPost: item.countReactionPost,
        countCommentPost: item.countCommentPost,
        top_comment: item.top_comment,
        keywords: found?.keywords || [],
        createdAt: item.createdAt,
      });

      console.log(`✅ Processed caption ${item.id}`);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  const outputPath = path.join(
    __dirname,
    "..",
    "data",
    "content_dataset_cleaned.json"
  );
  fs.writeFileSync(outputPath, JSON.stringify(cleanedData, null, 2), "utf-8");

  console.log("🎉 Xong! Đã làm sạch toàn bộ dataset");
};

const cleanForumDatasetWithLLM = async () => {
  const filePath = path.join(__dirname, "..", "data", "forum_dataset.json");
  const rawData = fs.readFileSync(filePath, "utf-8");
  const dataset = JSON.parse(rawData);
  const cleanedData = [];
  const batchSize = 10;
  for (let i = 0; i < dataset.length; i += batchSize) {
    const batch = dataset.slice(i, i + batchSize);
    console.log(`🚀 Đang xử lý batch ${i / batchSize + 1}`);
    const aiResult = await extractKeywordsLLM(
      batch.map((item) => ({
        id: item.id,
        caption: item.name,
        description: item.description,
      }))
    );
    for (const item of batch) {
      const found = aiResult.find((r) => r.id == item.id);
      cleanedData.push({
        id: item.id,
        name: item.name,
        description: item.description,
        keywords: found?.keywords || [],
      });

      console.log(`✅ Processed caption ${item.id}`);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  const outputPath = path.join(
    __dirname,
    "..",
    "data",
    "forum_dataset_cleaned.json"
  );
  fs.writeFileSync(outputPath, JSON.stringify(cleanedData, null, 2), "utf-8");

  console.log("🎉 Xong! Đã làm sạch toàn bộ dataset");
};

const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (normA * normB);
};

const calculationSimilarityContentForum = async () => {
  const forumsPath = path.join(
    __dirname,
    "..",
    "data",
    "forum_dataset_embeddings.json"
  );

  const contentPath = path.join(
    __dirname,
    "..",
    "data",
    "content_dataset_embeddings.json"
  );

  const forums = JSON.parse(fs.readFileSync(forumsPath, "utf8"));
  const contents = JSON.parse(fs.readFileSync(contentPath, "utf8"));

  // Gộp posts của cùng user
  const userEmbeddings = {};
  for (const content of contents) {
    if (!userEmbeddings[content.userId]) userEmbeddings[content.userId] = [];
    userEmbeddings[content.userId].push(content.embedding);
  }

  // Tính embedding trung bình cho mỗi user
  const averagedUsers = Object.entries(userEmbeddings).map(
    ([userId, embeddings]) => {
      const dim = embeddings[0].length;
      const avg = Array(dim).fill(0);
      for (const emb of embeddings) {
        for (let i = 0; i < dim; i++) {
          avg[i] += emb[i];
        }
      }
      for (let i = 0; i < dim; i++) avg[i] /= embeddings.length;
      return { userId: Number(userId), embedding: avg };
    }
  );

  // Tính cosine similarity tất cả forum
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

  // Ghi ra file
  const outputPath = path.join(
    __dirname,
    "..",
    "data",
    "similarity_content_forum.json"
  );
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf-8");

  console.log("Đã tính độ tương đồng của forum và content");
};

const calculationSimilarityBehaviorForum = async () => {
  const forumsPath = path.join(
    __dirname,
    "..",
    "data",
    "forum_dataset_embeddings.json"
  );

  const behaviorPath = path.join(
    __dirname,
    "..",
    "data",
    "behavior_dataset_embeddings.json"
  );

  const forums = JSON.parse(fs.readFileSync(forumsPath, "utf8"));
  const behaviors = JSON.parse(fs.readFileSync(behaviorPath, "utf8"));

  // Gộp embeddings của cùng user (nếu user học nhiều khóa)
  const userEmbeddings = {};
  for (const behavior of behaviors) {
    if (!userEmbeddings[behavior.userId]) userEmbeddings[behavior.userId] = [];
    userEmbeddings[behavior.userId].push(behavior.embedding);
  }

  // Tính embedding trung bình cho mỗi user
  const averagedUsers = Object.entries(userEmbeddings).map(
    ([userId, embeddings]) => {
      const dim = embeddings[0].length;
      const avg = Array(dim).fill(0);
      for (const emb of embeddings) {
        for (let i = 0; i < dim; i++) {
          avg[i] += emb[i];
        }
      }
      for (let i = 0; i < dim; i++) avg[i] /= embeddings.length;
      return { userId: Number(userId), embedding: avg };
    }
  );

  // Tính cosine similarity giữa mỗi user và tất cả forum
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

  // Ghi ra file
  const outputPath = path.join(
    __dirname,
    "..",
    "data",
    "similarity_behavior_forum.json"
  );
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf-8");

  console.log("Đã tính độ tương đồng giữa forum và behavior!");
};

const finalSimilarity = async () => {
  const alpha = 0.6;

  const contentSimPath = path.join(
    __dirname,
    "..",
    "data",
    "similarity_content_forum.json"
  );
  const behaviorSimPath = path.join(
    __dirname,
    "..",
    "data",
    "similarity_behavior_forum.json"
  );

  const contentSims = JSON.parse(fs.readFileSync(contentSimPath, "utf8"));
  const behaviorSims = JSON.parse(fs.readFileSync(behaviorSimPath, "utf8"));

  const behaviorMap = new Map();
  behaviorSims.forEach((b) => {
    behaviorMap.set(`${b.userId}-${b.forumId}`, b.similarity);
  });

  const finalResults = contentSims.map((c) => {
    const key = `${c.userId}-${c.forumId}`;
    const behaviorSim = behaviorMap.get(key) || 0;
    const finalScore = alpha * behaviorSim + (1 - alpha) * c.similarity;
    return {
      userId: c.userId,
      forumId: c.forumId,
      finalScore,
    };
  });

  const userMap = new Map();
  finalResults.forEach((item) => {
    if (!userMap.has(item.userId)) userMap.set(item.userId, []);
    userMap.get(item.userId).push(item);
  });
  const topResults = [];
  userMap.forEach((forums, userId) => {
    forums.sort((a, b) => b.finalScore - a.finalScore);
    const top3 = forums.slice(0, 3);
    top3.forEach((f) => topResults.push(f));
  });

  const outputPath = path.join(
    __dirname,
    "..",
    "data",
    "final_similarity_top3.json"
  );
  fs.writeFileSync(outputPath, JSON.stringify(topResults, null, 2), "utf8");

  console.log("Đã tính final similarity và lọc top 3 forum cho mỗi user!");
};

const extractKeywordsLLM = async (
  caption = "Khóa học ReactJS này rất là tuyệt vời luôn á các bạn"
) => {
  try {
    const prompt = `
Hãy trích xuất các từ khóa chính trong đoạn caption sau và chỉ trả về JSON thuần túy:
"${caption}"

⚠️ Chỉ trả về đúng cấu trúc JSON:
{ "keywords": ["từ khóa 1", "từ khóa 2"] }
Không thêm bất kỳ mô tả, giải thích hoặc ký tự nào khác.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      temperature: 0.2,
    });

    let text =
      response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!text) {
      console.error("⚠️ Không lấy được text từ phản hồi:", response);
      return [];
    }

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      console.warn("⚠️ Không tìm thấy JSON trong đầu ra:", text);
      return [];
    }
    const jsonText = match[0].trim();
    const json = JSON.parse(jsonText);

    return Array.isArray(json.keywords) ? json.keywords : [];
  } catch (err) {
    console.error("❌ LLM lỗi:", err);
    return [];
  }
};

const updateContentDataset = async (postId) => {
  const dataDir = path.join(__dirname, "../data");
  const cleanedPath = path.join(dataDir, "content_dataset_cleaned.json");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const post = await Post.findByPk(postId, {
    attributes: ["id", "userId", "post_caption", "createdAt"],
    include: [
      { model: PostReaction, as: "reactions", attributes: ["userId"] },
      {
        model: CommentPost,
        as: "comments",
        attributes: ["id", "userId", "content", "createdAt", "parentId"],
      },
    ],
  });

  if (!post) {
    console.warn(`⚠️ Không tìm thấy post ${postId}`);
    return;
  }
  const reactionUsers = post.reactions?.map((r) => r.userId) || [];
  const comments = post.comments || [];
  const replyMap = {};
  comments.forEach((c) => {
    if (c.parentId) replyMap[c.parentId] = (replyMap[c.parentId] || 0) + 1;
  });
  const topComment = comments
    .filter((c) => !c.parentId)
    .sort((a, b) => (replyMap[b.id] || 0) - (replyMap[a.id] || 0))[0];

  const newData = {
    id: post.id,
    userId: post.userId,
    caption: post.post_caption,
    createdAt: post.createdAt,
    countReactionPost: reactionUsers.length,
    countCommentPost: comments.length,
    top_comment: topComment
      ? {
          userId: topComment.userId,
          content: topComment.content,
          createdAt: topComment.createdAt,
          replyCount: replyMap[topComment.id] || 0,
        }
      : null,
  };

  const keywords = await extractKeywordsLLM(post.post_caption);
  let cleaned = [];
  try {
    if (fs.existsSync(cleanedPath)) {
      cleaned = JSON.parse(fs.readFileSync(cleanedPath, "utf-8"));
    }
  } catch (err) {
    console.error("❌ Lỗi đọc cleaned dataset:", err);
    cleaned = [];
  }

  const cleanedItem = { ...newData, keywords };
  const i = cleaned.findIndex((d) => d.id === post.id);
  if (i >= 0) cleaned[i] = cleanedItem;
  else cleaned.push(cleanedItem);

  try {
    fs.writeFileSync(cleanedPath, JSON.stringify(cleaned, null, 2), "utf-8");
    console.log(`Đã import vào content_dataset_cleaned.json (${post.id})`);
  } catch (err) {
    console.error("❌ Lỗi ghi cleaned dataset:", err);
  }
};

const updateBehaviorDataset = async (userId, courseId) => {
  try {
    const dataDir = path.join(__dirname, "../data");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    const filePath = path.join(dataDir, "behavior_dataset.json");
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]", "utf8");

    let dataset = [];
    try {
      dataset = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch {
      console.warn("behavior_dataset.json bị lỗi, tạo mới");
      dataset = [];
    }

    const course = await Course.findByPk(courseId, {
      attributes: ["id", "course_name"],
    });

    const courseName = course ? course.course_name : "Unknown Course";

    const topics = await Topic.findAll({
      where: { course_id: courseId },
      attributes: ["id"],
    });
    const topicIds = topics.map((t) => t.id);
    const totalTopics = topicIds.length;

    const userProgress = await UserTopicProgress.findAll({
      where: { user_id: userId, is_completed: true },
      attributes: ["topic_id"],
    });
    const learnedTopics = userProgress.map((u) => u.topic_id);

    const countLearned = topicIds.filter((id) =>
      learnedTopics.includes(id)
    ).length;
    const percentProgress =
      totalTopics > 0 ? (countLearned / totalTopics) * 100 : 0;

    const existingIndex = dataset.findIndex(
      (entry) => entry.userId === userId && entry.courseId === courseId
    );

    if (existingIndex !== -1) {
      dataset[existingIndex].percentProgress = percentProgress;
      dataset[existingIndex].courseName = courseName;
      dataset[existingIndex].updatedAt = new Date().toISOString();
    } else {
      dataset.push({
        userId,
        courseId,
        percentProgress,
        courseName,
        startDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    fs.writeFileSync(filePath, JSON.stringify(dataset, null, 2), "utf8");
    console.log(
      `Đã cập nhật behavior_dataset.json (User ${userId}, Course ${courseId}, ${percentProgress.toFixed(
        1
      )}%)`
    );
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật behavior_dataset:", error);
  }
};

// const generateWeeklyForumTopics = async () => {
//   try {
//     const forums = await Forum.findAll();
//     if (!forums.length) {
//       console.log("Không có forum nào trong hệ thống.");
//       return;
//     }

//     for (const forum of forums) {
//       try {
//         await new Promise((resolve) => setTimeout(resolve, 30000));
//         const lastTopic = await ForumTopic.findOne({
//           where: { forum_id: forum.id },
//           order: [["week", "DESC"]],
//         });

//         let newWeek = 1;
//         if (lastTopic) {
//           newWeek = lastTopic.week + 1;
//         }
//         const topicType = newWeek % 2 === 0 ? "quiz" : "discussion";
//         const prompt = `
// Diễn đàn: "${forum.name}"
// Mô tả: "${forum.description || ""}"

// Hãy tạo chủ đề cho tuần ${newWeek}.
// Chủ đề tuần này là "${topicType}".

// Nếu là "discussion" thì tạo 1 chủ đề thảo luận duy nhất.
// Nếu là "quiz" thì tạo 10 câu hỏi trắc nghiệm, mỗi câu có 4 lựa chọn và 1 đáp án đúng.

// Trả về JSON đúng định dạng sau:

// {
//   "week": ${newWeek},
//   "type": "${topicType}",
//   "topics": [
//     {
//       "title": "string",
//       "description": "string hoặc null",
//       "options": ["A", "B", "C", "D"] hoặc null,
//       "answer": "string hoặc null"
//     }
//   ]
// }
// `;

//         let response;
//         let retryCount = 0;
//         const maxRetries = 3;
//         while (retryCount < maxRetries) {
//           try {
//             response = await ai.models.generateContent({
//               model: "gemini-2.0-flash-lite",
//               contents: prompt,
//               temperature: 0.4,
//             });
//             break;
//           } catch (apiErr) {
//             if (apiErr.status === 429) {
//               retryCount++;
//               console.warn(
//                 `Rate limit hit cho forum "${forum.name}" (lần thử ${retryCount}/${maxRetries}). Chờ 60s trước khi thử lại...`
//               );
//               await new Promise((resolve) => setTimeout(resolve, 60000));
//             } else {
//               throw apiErr;
//             }
//           }
//         }

//         if (!response) {
//           console.warn(
//             `Bỏ qua forum "${forum.name}" sau ${maxRetries} lần thử thất bại do rate limit.`
//           );
//           continue;
//         }
//         await new Promise((resolve) => setTimeout(resolve, 2000));
//         const text =
//           response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
//           response?.candidates?.[0]?.output_text ||
//           "";
//         if (!text) {
//           console.warn(
//             `Không nhận được phản hồi từ AI cho forum "${forum.name}"`
//           );
//           continue;
//         }
//         const match = text.match(/\{[\s\S]*\}/);
//         if (!match) {
//           console.warn(`Không tìm thấy JSON trong output AI:`, text);
//           continue;
//         }

//         let data;
//         try {
//           data = JSON.parse(match[0]);
//         } catch (err) {
//           console.error("Lỗi parse JSON:", err, "\nRaw:", text);
//           continue;
//         }

//         if (!Array.isArray(data.topics)) {
//           console.warn(`Không có topics hợp lệ trong dữ liệu AI.`);
//           continue;
//         }

//         for (const topic of data.topics) {
//           const createdTopic = await ForumTopic.create({
//             forum_id: forum.id,
//             title: topic.title,
//             description: topic.description || null,
//             type: topicType,
//             week: newWeek,
//           });

//           if (topicType === "quiz") {
//             await Questionnaire.create({
//               forumTopicId: createdTopic.id,
//               question: topic.title,
//               options: Array.isArray(topic.options) ? topic.options : [],
//               answer: topic.answer || "",
//             });
//           }
//         }

//         console.log(
//           `Forum "${forum.name}" - tuần ${newWeek}: tạo ${data.topics.length} topic (${topicType})`
//         );
//       } catch (forumErr) {
//         console.error(`Lỗi khi xử lý forum "${forum.name}":`, forumErr);
//         await new Promise((resolve) => setTimeout(resolve, 5000));
//         continue;
//       }
//     }
//   } catch (err) {
//     console.error("Lỗi chung khi tạo chủ đề:", err);
//   }
// };

const exportQuizDataset = async () => {
  try {
    const dataDir = path.join(__dirname, "../data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const filePath = path.join(dataDir, "quiz_dataset.json");
    if (fs.existsSync(filePath)) {
      console.log("quiz_dataset.json đã tồn tại, bỏ qua export.");
      return;
    }

    const results = await QuizResult.findAll({
      include: [
        {
          model: QuizAnswer,
          as: "QuizAnswers",
        },
      ],
    });

    const dataset = results.map((r) => {
      const answers = r.QuizAnswers || [];
      const totalQuestions = r.total_questions || answers.length || 0;

      const correctCount =
        typeof r.correct_count === "number"
          ? r.correct_count
          : answers.filter((a) => a.is_correct).length;

      const accuracy = totalQuestions > 0 ? correctCount / totalQuestions : 0;

      const avgTime =
        answers.length > 0
          ? answers.reduce((sum, a) => sum + (a.time_spent || 0), 0) /
            answers.length
          : 0;

      const scoreOfquestion = 10 / totalQuestions;
      const score = parseFloat((correctCount * scoreOfquestion).toFixed(2));
      return {
        quiz_id: r.id,
        user_id: r.user_id,
        topic_id: r.topic_id,
        score,
        correct_count: correctCount,
        total_questions: totalQuestions,
        accuracy,
        attempt_number: r.attempt_number,
        avg_time_spent: avgTime,
        createdAt: r.createdAt,
      };
    });

    fs.writeFileSync(filePath, JSON.stringify(dataset, null, 2), "utf8");
    console.log(`Export quiz_dataset.json thành công (${dataset.length} dòng)`);
  } catch (error) {
    console.error("Lỗi exportQuizDataset:", error);
  }
};

const DeleteQuizDataset = async () => {
  const dataDir = path.join(__dirname, "../data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const filePath = path.join(dataDir, "quiz_dataset.json");
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log("Đã xóa quiz_dataset.json");
  } else {
    console.log("File quiz_dataset.json không tồn tại");
  }
};

const trainQuizModelInBackground = () => {
  try {
    const pythonBin = process.env.PYTHON_BIN || "python";
    const scriptPath = path.join(
      __dirname,
      "..",
      "recommendation",
      "gb_train.py"
    );
    console.log("Bắt đầu train model GradientBoosting (quiz)...");
    const child = spawn(pythonBin, [scriptPath, "--mode", "train"], {
      cwd: path.join(__dirname, ".."),
    });
    child.stdout.on("data", (data) => {
      console.log("[gb_train.py stdout]:", data.toString());
    });

    child.stderr.on("data", (data) => {
      console.error("[gb_train.py stderr]:", data.toString());
    });
    child.on("close", (code) => {
      if (code === 0) {
        console.log("Train model quiz xong (exit code 0).");
      } else {
        console.error("Train model quiz lỗi, exit code:", code);
      }
    });
  } catch (err) {
    console.error("Lỗi trainQuizModelInBackground:", err);
  }
};

const trainWeakTopicsModel = async () => {
  return new Promise((resolve, reject) => {
    const pythonBin = process.env.PYTHON_BIN || "python";
    const scriptPath = path.join(
      __dirname,
      "..",
      "recommendation",
      "gb_train.py"
    );
    console.log("Bắt đầu train mô hình weak topics...");
    const py = spawn(pythonBin, [scriptPath, "--mode", "train"], {
      cwd: path.join(__dirname, ".."),
    });
    let output = "";
    let errorOutput = "";
    py.stdout.on("data", (data) => {
      output += data.toString();
    });

    py.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });
    py.on("close", (code) => {
      if (code !== 0) {
        console.error("Train model lỗi:", errorOutput);
        return reject(
          new Error("Train GradientBoosting thất bại: " + errorOutput)
        );
      }

      console.log("Train mô hình xong:", output);
      resolve(output);
    });
  });
};

const GetWeakTopicsRecommendation = async () => {
  try {
    const pythonBin = process.env.PYTHON_BIN || "python";
    const scriptPath = path.join(
      __dirname,
      "..",
      "recommendation",
      "gb_predict.py"
    );

    const py = spawn(pythonBin, [scriptPath, "--mode", "diagnose"], {
      cwd: path.join(__dirname, ".."),
    });

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

      const weakTopics = parsed.users || [];
      const saveDir = path.join(__dirname, "../data");
      if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir, { recursive: true });
      }
      const filePath = path.join(saveDir, `weektopic_all_users.json`);
      const dataToSave = {
        weak_topics: weakTopics,
        updated_at: new Date().toISOString(),
      };

      fs.writeFile(filePath, JSON.stringify(dataToSave, null, 2), (err) => {
        if (err) {
          console.error("Lỗi ghi file weak topic:", err);
          return err;
        }
      });
    });
  } catch (error) {
    console.error("GetWeakTopicsRecommendation error:", error);
    return error;
  }
};

const generateContentSuggestionTopicWeak = async (req, res) => {
  try {
    const { id } = req.params;
    const numQuestions = 5;
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);

    const topic = await Topic.findByPk(id);
    if (!topic) {
      return res.status(404).json({ message: "Không tìm thấy topic" });
    }

    let topicWeak = await TopicWeak.findOne({
      where: { topic_id: topic.id },
    });

    const contentVideo = await Video.findOne({ where: { topic_id: id } });
    const contentLecture = await Lecture.findOne({ where: { topic_id: id } });

    if (topicWeak) {
      const questions = await QuestionTopicWeak.findAll({
        where: { topic_weak_id: topicWeak.id },
      });

      return res.status(200).json({
        message: `Topic ${topic.topic_name} đã có dữ liệu, sử dụng dữ liệu cũ`,
        data: {
          topicWeak: {
            id: topicWeak.id,
            topic_id: topicWeak.topic_id,
            lecture: contentLecture?.file_path || null,
            video: contentVideo?.video_url || null,
          },
          questions: questions.map((q) => ({
            id: q.id,
            question_text: q.question_text,
            options: q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
          })),
        },
      });
    }

    // Tạo prompt AI
    const prompt = `
Bạn là trợ lý xây dựng câu hỏi trắc nghiệm cho khóa học về chủ đề ${
      topic.topic_name
    }

Nhiệm vụ:
- Đọc hiểu nội dung bài giảng và chủ đề bên dưới.
- TỰ TẠO ra các câu hỏi trắc nghiệm mới, không trùng lặp câu chữ với nội dung gốc.

Chủ đề: "${topic.topic_name}"
Mô tả: "${topic.topic_description || ""}"

Yêu cầu tạo CHÍNH XÁC ${numQuestions} câu trắc nghiệm, mỗi câu:
- Có trường "question_text"
- Có 4 lựa chọn A, B, C, D
- Có "correct_answer"
- Có "explanation"

Chỉ trả về JSON THUẦN đúng cấu trúc:
{
  "questions": [
    {
      "question_text": "string",
      "options": { "A": "string", "B": "string", "C": "string", "D": "string" },
      "correct_answer": "A" | "B" | "C" | "D",
      "explanation": "string"
    }
  ]
}
`;

    // Gọi AI
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
      return res.status(500).json({ message: "AI không trả dữ liệu" });
    }

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      console.warn("Không tìm thấy JSON trong output AI cho topic", topic.id);
      return res.status(500).json({ message: "AI trả dữ liệu không hợp lệ" });
    }

    const data = JSON.parse(match[0]);
    const questions = Array.isArray(data.questions) ? data.questions : [];

    // 1. Tạo 1 TopicWeak
    topicWeak = await TopicWeak.create({
      topic_id: topic.id,
      suggested_lesson: contentLecture?.file_path || null,
    });

    // 2. Tạo QuestionTopicWeak từ từng câu hỏi AI
    const savedQuestions = [];
    for (const q of questions) {
      const question = await QuestionTopicWeak.create({
        topic_weak_id: topicWeak.id,
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation || "",
      });
      savedQuestions.push(question);
    }

    return res.status(200).json({
      message: `Đã lưu ${savedQuestions.length} câu hỏi cho topic ${topic.topic_name}`,
      data: {
        topicWeak: {
          id: topicWeak.id,
          topic_id: topicWeak.topic_id,
          lecture: contentLecture?.file_path || null,
          video: contentVideo?.video_url || null,
        },
        questions: savedQuestions.map((q) => ({
          id: q.id,
          question_text: q.question_text,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
        })),
      },
    });
  } catch (err) {
    console.error("Lỗi generateTopicWeakAPI:", err);
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

//Improve

function getDatasetTopic(forumName, weekNumber) {
  const forumData = contentDataset.forums.find((f) => f.name === forumName);
  if (!forumData) return null;
  const topics = forumData.topics;
  if (!topics || !topics.length) return null;
  const index = (weekNumber - 1) % topics.length;
  return topics[index];
}

function pickRandom(arr, count) {
  return arr.sort(() => 0.5 - Math.random()).slice(0, count);
}

function normalizeOptions(rawOptions) {
  if (Array.isArray(rawOptions)) {
    return rawOptions;
  }
  if (typeof rawOptions === "string") {
    const parts = rawOptions
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    return parts;
  }

  if (typeof rawOptions === "object" && rawOptions !== null) {
    return Object.values(rawOptions);
  }

  return [];
}

const generateWeeklyForumTopics = async () => {
  try {
    const forums = await Forum.findAll();
    if (!forums.length) {
      console.log("Không có forum nào trong hệ thống.");
      return;
    }

    for (const forum of forums) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const lastTopic = await ForumTopic.findOne({
          where: { forum_id: forum.id },
          order: [["week", "DESC"]],
        });
        const newWeek = lastTopic ? lastTopic.week + 1 : 1;
        const topicData = getDatasetTopic(forum.name, newWeek);
        if (!topicData) {
          console.warn(
            `Không có dữ liệu dataset cho: ${forum.name} - Week ${newWeek}`
          );
          continue;
        }
        if (topicData.type === "discussion") {
          await ForumTopic.create({
            forum_id: forum.id,
            title: topicData.title,
            description: topicData.description || null,
            type: "discussion",
            week: newWeek,
          });
          console.log(`${forum.name} - Week ${newWeek} (discussion) đã tạo.`);
        } else if (topicData.type === "quiz") {
          const selected = pickRandom(topicData.questions, 10);
          for (const q of selected) {
            const createdTopic = await ForumTopic.create({
              forum_id: forum.id,
              title: q.question,
              description: null,
              type: "quiz",
              week: newWeek,
            });

            await Questionnaire.create({
              forumTopicId: createdTopic.id,
              question: q.question,
              options: normalizeOptions(q.options),
              answer: q.answer,
            });
          }
          console.log(
            `${forum.name} - Week ${newWeek} (quiz) đã tạo ${selected.length} câu.`
          );
        }
      } catch (forumErr) {
        console.error(`Lỗi khi xử lý forum "${forum.name}":`, forumErr);
      }
    }
  } catch (err) {
    console.error("Lỗi chung:", err);
  }
};

module.exports = {
  GetContentDataset,
  GetBehaviorUser,
  cleanContentDatasetWithLLM,
  cleanForumDatasetWithLLM,
  calculationSimilarityContentForum,
  calculationSimilarityBehaviorForum,
  finalSimilarity,
  updateContentDataset,
  updateBehaviorDataset,
  generateWeeklyForumTopics,
  extractKeywordsLLM,
  exportQuizDataset,
  trainQuizModelInBackground,
  trainWeakTopicsModel,
  GetWeakTopicsRecommendation,
  generateContentSuggestionTopicWeak,
  DeleteQuizDataset,
};
