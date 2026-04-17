import { GoogleGenerativeAI } from "@google/generative-ai";
import Book from "../models/Book.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const chatbotMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 🔎 Search books
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

    // fallback books
    const bookList =
      books.length > 0
        ? books
        : await Book.find()
            .limit(6)
            .select("title author price category description rating");

    // 🧠 Prepare context
    const bookContext = bookList
      .map(
        (b, i) =>
          `${i + 1}. "${b.title}" by ${b.author} — ${Array.isArray(b.category) ? b.category.join(", ") : b.category}, ${b.price} EGP, Rating: ${b.rating || "N/A"}`,
      )
      .join("\n");

    const prompt = `
You are BookBot, a smart assistant for an online bookstore.

Rules:
- Recommend ONLY 2-3 books
- Keep answers short (max 3 sentences)
- Be friendly
- Do NOT invent books
- Use ONLY the list below

Books:
${bookContext}

User: "${message}"

Reply in same language (Arabic or English).
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite-preview-02-05",
    });
    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    res.json({
      reply,
      books: bookList,
    });
  } catch (error) {
    console.error(
      "Chatbot FULL error:",
      error.response?.data || error.message || error,
    );
    res.status(500).json({
      error: "Something went wrong",
    });
  }
};
