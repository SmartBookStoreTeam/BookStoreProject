import { GoogleGenerativeAI } from "@google/generative-ai";
import Book from "../models/Book.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const chatbotMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    // Fetch books from your MongoDB — search by title, category, description
    const books = await Book.find({
      $or: [
        { title: { $regex: message, $options: "i" } },
        { category: { $regex: message, $options: "i" } },
        { description: { $regex: message, $options: "i" } },
        { author: { $regex: message, $options: "i" } },
      ],
    })
      .limit(8)
      .select("title author price category description rating");

    // If no specific match, get a general sample of books
    const bookList =
      books.length > 0
        ? books
        : await Book.find()
            .limit(8)
            .select("title author price category description rating");

    // Format books for the AI
    const bookContext = bookList
      .map(
        (b, i) =>
          `${i + 1}. "${b.title}" by ${b.author} — Category: ${b.category}, Price: ${b.price} EGP, Rating: ${b.rating || "N/A"}/5
   Description: ${b.description?.slice(0, 120) || "No description"}...`,
      )
      .join("\n\n");

    const prompt = `You are BookBot, a friendly assistant for an online bookstore.
You help customers find books they'll love based on their mood, genre preferences, or interests.
Always be warm, enthusiastic about books, and keep responses concise (max 3-4 sentences).
If recommending a book, mention its title, author, and why it matches what the customer wants.
Only recommend books from the list below — do not invent books.

Available books in our store:
${bookContext}

Customer message: "${message}"

Reply in the same language the customer used (Arabic or English).`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    res.json({ reply });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ error: "Something went wrong, please try again." });
  }
};
