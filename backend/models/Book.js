import mongoose from "mongoose";

// slug بسيط (بدون مكتبات)
function slugify(text = "") {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-") // spaces -> -
    .replace(/-+/g, "-"); // multiple - -> single
}

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Book title is required"],
      trim: true,
      maxlength: 180,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    author: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
      maxlength: 120,
    },

    description: {
      type: String,
      required: [true, "Book description is required"],
      maxlength: 5000,
    },
    year: {
      type: String,
    },
    // ✅ category ObjectId
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Book category is required"],
      index: true,
    },

    price: {
      type: Number,
      required: [true, "Book price is required"],
      min: [0, "Price cannot be negative"],
    },

    image: {
      type: String,
      required: [true, "Book image is required"],
    },

    // ✅ لا ترجع مسار الـ PDF للعميل
    pdf: {
      type: String,
      required: [true, "Book PDF file is required"],
      select: false,
    },
    previewPdf: {
      type: String,
      required: [true, "Book PreviewPDF file is required"],
    },

    fileMeta: {
      size: { type: Number }, // bytes
      pages: { type: Number },
      mime: { type: String }, // application/pdf
    },
    previewMeta: {
      size: Number,
      pages: Number,
      mime: String,
    },
    // ⭐ rating الاحترافي: Avg + Count
    ratingAvg: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // initial embeded
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String, trim: true, maxlength: 1000 },
        isHidden: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    sales: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    views: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// indexes useful for searching filtring
bookSchema.index({ title: "text", author: "text", description: "text" });
bookSchema.index({ category: 1, price: 1 });
bookSchema.index({ status: 1, isActive: 1, createdAt: -1 });

//  uniqueness before save and auto slugs generation
bookSchema.pre("validate", async function () {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title);
  }

  // If title changed, regenerate slug
  if (this.isModified("title")) {
    this.slug = slugify(this.title);
  }

  // Ensure slug uniqueness
  if (this.isModified("slug")) {
    const base = this.slug;
    let counter = 2;

    // Keep checking until we find a unique slug
    while (true) {
      const exists = await mongoose.models.Book.findOne({
        slug: this.slug,
        _id: { $ne: this._id },
      }).select("_id");

      if (!exists) break;

      this.slug = `${base}-${counter}`;
      counter += 1;
    }
  }
});

// helper لتحديث ratingAvg/ratingCount عند إضافة/حذف/تعديل reviews
bookSchema.methods.recalculateRating = function () {
  const visible = (this.reviews || []).filter((r) => !r.isHidden);
  const count = visible.length;

  if (count === 0) {
    this.ratingAvg = 0;
    this.ratingCount = 0;
    return;
  }

  const sum = visible.reduce((acc, r) => acc + (r.rating || 0), 0);
  this.ratingCount = count;
  this.ratingAvg = Math.round((sum / count) * 10) / 10; // 1 decimal
};

const Book = mongoose.model("Book", bookSchema);
export default Book;
