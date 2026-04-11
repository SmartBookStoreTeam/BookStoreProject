import Book from "../models/Book.js";
import Order from "../models/Order.js";

/**
 * @desc    Get author dashboard stats and books
 * @route   GET /api/author/dashboard
 * @access  Author (role: author)
 */
export const getAuthorDashboard = async (req, res, next) => {
  try {
    const authorName = req.user.name;

    // Fetch all books by this author
    const books = await Book.find({ author: authorName })
      .populate("categories", "name")
      .sort({ createdAt: -1 })
      .lean();

    // Aggregate stats
    const totalBooks = books.length;
    const totalSales = books.reduce((sum, b) => sum + (b.sales || 0), 0);
    const totalViews = books.reduce((sum, b) => sum + (b.views || 0), 0);

    // Weighted average rating
    let ratingSum = 0;
    let ratingCount = 0;
    books.forEach((b) => {
      if (b.ratingCount > 0) {
        ratingSum += b.ratingAvg * b.ratingCount;
        ratingCount += b.ratingCount;
      }
    });
    const avgRating = ratingCount > 0 ? ratingSum / ratingCount : 0;

    // Revenue from orders containing author's books
    const bookIds = books.map((b) => b._id);

    const revenueResult = await Order.aggregate([
      { $match: { status: "approved" } },
      { $unwind: "$items" },
      { $match: { "items.book": { $in: bookIds } } },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: { $multiply: ["$items.priceSnapshot", "$items.quantity"] },
          },
        },
      },
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Monthly revenue trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          status: "approved",
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      { $unwind: "$items" },
      { $match: { "items.book": { $in: bookIds } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: {
            $sum: { $multiply: ["$items.priceSnapshot", "$items.quantity"] },
          },
          sales: { $sum: "$items.quantity" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthlyData = monthlyRevenue.map((item) => {
      const date = new Date(item._id.year, item._id.month - 1);
      return {
        month: date.toLocaleString("default", { month: "short" }),
        revenue: item.revenue,
        sales: item.sales,
      };
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalBooks,
          totalSales,
          totalViews,
          totalRevenue,
          avgRating: Math.round(avgRating * 10) / 10,
        },
        books,
        monthlyData,
        author: {
          name: req.user.name,
          email: req.user.email,
          avatar: req.user.avatar,
          bio: req.user.bio,
          portfolioLink: req.user.portfolioLink,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
