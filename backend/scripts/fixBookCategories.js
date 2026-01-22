import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Book from '../models/Book.js';
import Category from '../models/Category.js';

dotenv.config();

const fixBookCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find or create a default category
    let defaultCategory = await Category.findOne({ name: "General" });
    
    if (!defaultCategory) {
      defaultCategory = await Category.create({
        name: "General",
        slug: "general",
        isActive: true
      });
      console.log("✅ Created default 'General' category");
    } else {
      console.log("ℹ️  'General' category already exists");
    }

    // Find the "Uncategorized" category if it exists
    const uncategorizedCategory = await Category.findOne({ 
      name: { $regex: /^uncategorized$/i } 
    });

    // Find all books without a category OR with "Uncategorized" category
    const query = {
      $or: [
        { category: null },
        { category: { $exists: false } }
      ]
    };

    // If Uncategorized category exists, include it in the search
    if (uncategorizedCategory) {
      query.$or.push({ category: uncategorizedCategory._id });
      console.log(`ℹ️  Found 'Uncategorized' category, will reassign these books too`);
    }

    const booksWithoutCategory = await Book.find(query);

    console.log(`\n📚 Found ${booksWithoutCategory.length} books without categories`);

    // Update books to use default category
    if (booksWithoutCategory.length > 0) {
      const updateQuery = {
        $or: [
          { category: null },
          { category: { $exists: false } }
        ]
      };

      // Add Uncategorized category to update query if it exists
      if (uncategorizedCategory) {
        updateQuery.$or.push({ category: uncategorizedCategory._id });
      }

      const result = await Book.updateMany(
        updateQuery,
        {
          $set: { category: defaultCategory._id }
        }
      );

      console.log(`✅ Updated ${result.modifiedCount} books to use 'General' category`);
    }

    // Show summary
    console.log("\n📊 Summary:");
    const allBooks = await Book.find().populate('category', 'name');
    
    const categoryCounts = {};
    allBooks.forEach(book => {
      const categoryName = book.category?.name || 'Uncategorized';
      categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
    });

    console.log("\nBooks by category:");
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} books`);
    });

    console.log("\n✨ Done!");
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n👋 Disconnected from MongoDB");
    process.exit(0);
  }
};

fixBookCategories();
