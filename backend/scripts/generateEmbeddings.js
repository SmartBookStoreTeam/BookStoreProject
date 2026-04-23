import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mongoose from "mongoose";
import { generateEmbedding } from "../utils/embeddingService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

async function generateEmbeddings() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("❌ MONGO_URI is undefined.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");

  // Import Book AFTER mongoose is connected
  const { default: Book } = await import("../models/Book.js");

  const books = await Book.find({
    $or: [
      { embedding: { $exists: false } },
      { embedding: { $size: 0 } },
      { embedding: null },
    ],
  });

  console.log(`📚 Found ${books.length} books without embeddings\n`);

  if (books.length === 0) {
    console.log("🎉 All books already have embeddings!");
    process.exit(0);
  }

  let success = 0;
  let failed = 0;

  for (const book of books) {
    try {
      const text = [
        book.title,
        book.description || book.desc || "",
        book.genre || book.category || "",
        book.author || "",
        book.edition,
        book.year,
      ]
        .filter(Boolean)
        .join(" ");

      const embedding = await generateEmbedding(text);

      // Use save() directly on the document instead of findByIdAndUpdate
      book.embedding = embedding;
      await book.save();

      console.log(`✅ ${book.title}`);
      success++;
    } catch (err) {
      console.error(`❌ Failed: ${book.title} → ${err.message}`);
      failed++;
    }
  }

  console.log(`\n--- Done ---`);
  console.log(`✅ Success: ${success}`);
  console.log(`❌ Failed:  ${failed}`);
  process.exit(0);
}

generateEmbeddings();
