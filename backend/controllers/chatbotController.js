import { GoogleGenerativeAI } from "@google/generative-ai";
import Book from "../models/Book.js";

// قراءة المفاتيح من ملف الـ .env
const apiKeys = process.env.GEMINI_API_KEYS
  ? process.env.GEMINI_API_KEYS.split(",").map((key) => key.trim()) // تنظيف الفراغات إن وجدت
  : [];

let currentKeyIndex = 0;

export const chatbotMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // التحقق من وجود مفاتيح قبل البدء
    if (apiKeys.length === 0) {
      console.error("No API keys found in environment variables.");
      return res
        .status(500)
        .json({ error: "Configuration error: Missing API keys." });
    }

    // 🔎 البحث عن الكتب (كما هو في كودك)
    const books = await Book.find({
      $or: [
        { title: { $regex: message, $options: "i" } },
        { category: { $regex: message, $options: "i" } },
        { description: { $regex: message, $options: "i" } },
        { author: { $regex: message, $options: "i" } },
      ],
    })
      .limit(6)
      .select("title author price category description rating");

    const bookList =
      books.length > 0
        ? books
        : await Book.find()
            .limit(6)
            .select("title author price category description rating");

    const bookContext = bookList
      .map(
        (b, i) =>
          `${i + 1}. "${b.title}" by ${b.author} — ${Array.isArray(b.category) ? b.category.join(", ") : b.category}, ${b.price} EGP`,
      )
      .join("\n");

    const prompt = `You are BookBot, a friendly assistant. Recommend 2-3 books from this list:\n${bookContext}\nUser: "${message}"`;

    // 🔄 منطق التبديل الذكي
    let reply = "";
    let success = false;
    let attempts = 0;

    // سنحاول فقط بعدد المفاتيح الموجودة
    while (!success && attempts < apiKeys.length) {
      try {
        const genAI = new GoogleGenerativeAI(apiKeys[currentKeyIndex]);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
        });

        const result = await model.generateContent(prompt);
        reply = result.response.text();
        success = true;
      } catch (error) {
        const errorMsg = error.message?.toLowerCase() || "";

        // التحقق من خطأ الحصة أو كثرة الطلبات
        if (
          errorMsg.includes("429") ||
          errorMsg.includes("quota") ||
          errorMsg.includes("limit")
        ) {
          console.warn(
            `⚠️ Key ${currentKeyIndex + 1} exhausted. Trying next...`,
          );
          currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length; // التبديل للمفتاح التالي
          attempts++;
        } else {
          // إذا كان الخطأ شيئاً آخر (مثل مشكلة في الـ Prompt)، توقف فوراً
          throw error;
        }
      }
    }

    if (!success) {
      return res
        .status(429)
        .json({
          error: "All keys are temporarily busy. Try again in a minute.",
        });
    }

    res.json({ reply, books: bookList });
  } catch (error) {
    console.error("Chatbot Error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
