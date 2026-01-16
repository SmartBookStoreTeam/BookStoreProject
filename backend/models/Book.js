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
      index: true,
    },

    price: {
      type: Number,
      required: [true, "Book price is required"],
      min: [0, "Price cannot be negative"],
    },

    // 📷 صورة الغلاف
    image: {
      type: String,
      required: [true, "Book image is required"],
    },

    // 📄 ملف الـ PDF (مش رابط مباشر للعميل)
    pdf: {
      type: String,
      required: [true, "Book PDF file is required"],
      // select: false, // مهم للأمان
    },

    // ⭐ التقييمات
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    numReviews: {
      type: Number,
      default: 0,
    },

    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    //  عدد مرات البيع
    sales: {
      type: Number,
      default: 0,
    },

    //  عدد المشاهدات (اختياري)
    views: {
      type: Number,
      default: 0,
    },

    //  حالة الكتاب
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);

export default Book;
