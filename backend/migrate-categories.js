/**
 * Migration: category → categories (array)
 * Run once: node migrate-categories.js
 *
 * This script finds all books that have a single `category` field (old format)
 * and converts it to the new `categories` array format.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

await mongoose.connect(MONGO_URI);
console.log("✅ Connected to MongoDB");

const db = mongoose.connection.db;
const booksCollection = db.collection("books");

// Find books that have the old `category` field (ObjectId, not array)
// and either no `categories` field or an empty array
const books = await booksCollection
  .find({
    category: { $exists: true, $ne: null },
    $or: [
      { categories: { $exists: false } },
      { categories: { $size: 0 } },
    ],
  })
  .toArray();

console.log(`📚 Found ${books.length} books to migrate`);

let updated = 0;
for (const book of books) {
  await booksCollection.updateOne(
    { _id: book._id },
    {
      $set: { categories: [book.category] },
      $unset: { category: "" },
    }
  );
  updated++;
}

console.log(`✅ Migrated ${updated} books: category → categories array`);
await mongoose.disconnect();
console.log("🔌 Disconnected");
