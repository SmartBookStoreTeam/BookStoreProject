import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Book title is required"],
      trim: true,
    },
    author: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Book description is required"],
    },
    category: {
      type: String,
      required: [true, "Book category is required"],
    },
    price: {
      type: Number,
      required: [true, "Book price is required"],
      min: [0, "Price cannot be negative"],
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    image: {
      type: String,
      //   required: [true, "Book image URL is required"],
    },
    ratings: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot be more than 5"],
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Published", "Draft", "Archived", "Unavailable"],
      default: "Published",
    },
    sales: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);

export default Book;
