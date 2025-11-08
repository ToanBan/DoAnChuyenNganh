const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { Forum } = require("../models");

const getRecommendedForums = async (req, res) => {
  try {

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    const userId = decoded.id;
    const filePath = path.resolve("data/final_similarity_top3.json");
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "No recommendations found yet" });
    }

    const all = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const userRec = all.filter((r) => r.userId === userId);
    if (userRec.length === 0) {
      return res.status(200).json({ message: "No forum recommendations for this user", recommendations: [] });
    }
    const forumIds = userRec.map((r) => r.forumId);
    const forums = await Forum.findAll({
      where: { id: forumIds },
      attributes: ["id", "name", "description", "tags", "status", "createdAt"],
    });
    const recommendations = forums.map((forum) => {
      const score = userRec.find((r) => r.forumId === forum.id)?.finalScore || 0;
      return {
        id: forum.id,
        name: forum.name,
        description: forum.description,
        tags: forum.tags,
        status: forum.status,
        createdAt: forum.createdAt,
        finalScore: score,
      };
    });
    recommendations.sort((a, b) => b.finalScore - a.finalScore);

    return res.status(200).json({
      userId,
      recommendations,
    });
  } catch (error) {
    console.error("Error in getRecommendedForums:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { getRecommendedForums };
