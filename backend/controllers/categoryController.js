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
