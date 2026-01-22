import Category from "../models/Category.js";

function slugify(text = "") {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Public: used for dropdowns
export const getActiveCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select("name slug isActive")
      .sort({ name: 1 });

    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

// Admin: list with pagination/search
export const getAdminCategories = async (req, res, next) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.page) || 1;
    const q = req.query.q?.trim();
    const isActive = req.query.isActive; // "true" | "false"

    const filter = {};
    if (q) filter.name = { $regex: q, $options: "i" };
    if (isActive === "true") filter.isActive = true;
    if (isActive === "false") filter.isActive = false;

    const total = await Category.countDocuments(filter);

    const categories = await Category.find(filter)
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      success: true,
      data: categories,
      meta: { page, pageSize, total, pages: Math.ceil(total / pageSize) },
    });
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "name is required" });
    }

    const cleanName = name.trim();
    const slug = slugify(cleanName);

    const exists = await Category.findOne({
      $or: [{ name: cleanName }, { slug }],
    }).select("_id");
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "Category already exists" });
    }

    const category = await Category.create({ name: cleanName, slug });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { name, isActive } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });

    if (name !== undefined) {
      const cleanName = String(name).trim();
      if (!cleanName) {
        return res
          .status(400)
          .json({ success: false, message: "name cannot be empty" });
      }
      category.name = cleanName;
      category.slug = slugify(cleanName);
    }

    if (isActive !== undefined) {
      category.isActive = Boolean(isActive);
    }

    await category.save();

    res.json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!category)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });

    res.json({
      success: true,
      message: "Category disabled successfully",
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get top categories by revenue
// @route   GET /api/admin/categories/top-revenue
// @access  Admin
export const getTopCategoriesByRevenue = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 5;
    
    // Import Order model dynamically to avoid circular dependency
    const Order = (await import("../models/Order.js")).default;
    
    const topCategories = await Order.aggregate([
      { $match: { status: "approved" } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "books",
          localField: "items.book",
          foreignField: "_id",
          as: "bookData",
        },
      },
      { $unwind: "$bookData" },
      {
        $lookup: {
          from: "categories",
          localField: "bookData.category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      { $unwind: "$categoryData" },
      {
        $group: {
          _id: "$categoryData._id",
          category: { $first: "$categoryData.name" },
          revenue: { $sum: { $multiply: ["$items.priceSnapshot", "$items.quantity"] } },
          orders: { $sum: 1 }
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          category: 1,
          sales: "$revenue", // Rename for frontend compatibility
          revenue: 1,
          orders: 1,
          growth: { $literal: "+0%" } // Placeholder for growth
        }
      }
    ]);

    res.json({
      success: true,
      data: topCategories,
    });
  } catch (err) {
    console.error("Error getting top categories:", err);
    next(err);
  }
};
