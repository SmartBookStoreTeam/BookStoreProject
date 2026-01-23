import Order from "../models/Order.js";
import User from "../models/User.js";
import Book from "../models/Book.js";

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's orders count
    const todaysOrders = await Order.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
    });

    // Today's revenue (sum of approved orders today)
    const todaysRevenueResult = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
          status: "approved",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]);
    const todaysRevenue = todaysRevenueResult[0]?.total || 0;

    // New customers today
    const newCustomersToday = await User.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
      role: "user",
    });

    // Pending orders count
    const pendingOrders = await Order.countDocuments({
      status: "pending",
    });

    // Total active books
    const totalBooks = await Book.countDocuments({
      isActive: true,
    });

    // Average book rating
    const avgRatingResult = await Book.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$ratingAvg" },
        },
      },
    ]);
    const averageRating = avgRatingResult[0]?.avgRating || 0;

    // Total customers
    const totalCustomers = await User.countDocuments({
      role: "user",
    });

    // Return customers (users with more than one order)
    const returnCustomersResult = await Order.aggregate([
      {
        $group: {
          _id: "$user",
          orderCount: { $sum: 1 },
        },
      },
      {
        $match: {
          orderCount: { $gt: 1 },
        },
      },
      {
        $count: "returnCustomers",
      },
    ]);
    const returnCustomers = returnCustomersResult[0]?.returnCustomers || 0;
    const returnCustomerPercentage =
      totalCustomers > 0 ? (returnCustomers / totalCustomers) * 100 : 0;

    // Yesterday's stats for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdaysOrders = await Order.countDocuments({
      createdAt: { $gte: yesterday, $lt: today },
    });

    const yesterdaysRevenueResult = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: yesterday, $lt: today },
          status: "approved",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]);
    const yesterdaysRevenue = yesterdaysRevenueResult[0]?.total || 0;

    const yesterdaysNewCustomers = await User.countDocuments({
      createdAt: { $gte: yesterday, $lt: today },
      role: "user",
    });

    res.json({
      success: true,
      data: {
        todaysOrders,
        todaysRevenue,
        newCustomersToday,
        pendingOrders,
        totalBooks,
        averageRating,
        returnCustomerPercentage,
        // Changes from yesterday
        ordersChange: todaysOrders - yesterdaysOrders,
        revenueChange: todaysRevenue - yesterdaysRevenue,
        customersChange: newCustomersToday - yesterdaysNewCustomers,
      },
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Get detailed analytics data
// @route   GET /api/admin/dashboard/analytics
// @access  Admin
export const getAnalyticsData = async (req, res, next) => {
  try {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    // 1. Total Metrics
    const totalSalesResult = await Order.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    const totalSales = totalSalesResult[0]?.total || 0;

    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: "user" });

    // Weekly Growth (Orders)
    const thisWeekOrders = await Order.countDocuments({
      createdAt: { $gte: lastWeek },
    });
    const lastWeekOrders = await Order.countDocuments({
      createdAt: { $gte: twoWeeksAgo, $lt: lastWeek },
    });
    
    let weeklyGrowth = 0;
    if (lastWeekOrders > 0) {
      weeklyGrowth = ((thisWeekOrders - lastWeekOrders) / lastWeekOrders) * 100;
    } else if (thisWeekOrders > 0) {
      weeklyGrowth = 100;
    }

    // Daily Average (Last 30 days)
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const last30DaysOrders = await Order.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });
    const dailyAverage = last30DaysOrders / 30;

    // 2. Monthly Sales Trend (Last 6 months)
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1); // Start of month

    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: "approved",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          sales: { $sum: "$total" },
          orders: { $sum: 1 },
          // customers: { $addToSet: "$user" } // unique customers
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Format monthly data for chart
    const monthlyData = monthlySales.map((item) => {
      const date = new Date(item._id.year, item._id.month - 1);
      return {
        month: date.toLocaleString('default', { month: 'short' }),
        sales: item.sales,
        orders: item.orders,
      };
    });

    // 3. Top Categories by Revenue
    let topCategories = [];
    try {
      topCategories = await Order.aggregate([
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
            _id: "$categoryData.name",
            sales: { $sum: { $multiply: ["$items.priceSnapshot", "$items.quantity"] } },
            quantity: { $sum: "$items.quantity" }
          },
        },
        { $sort: { sales: -1 } },
        { $limit: 5 },
        {
          $project: {
            category: "$_id",
            sales: 1,
            growth: { $literal: "+0%" } 
          }
        }
      ]);
    } catch (err) {
      console.error("Top Categories aggregation failed:", err);
    }

    // 4. Top Selling Books
    let topBooks = [];
    try {
      topBooks = await Order.aggregate([
        { $match: { status: "approved" } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.titleSnapshot",
            author: { $first: "$items.book" },
            sales: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.priceSnapshot", "$items.quantity"] } },
          },
        },
        {
          $lookup: {
            from: "books",
            localField: "author",
            foreignField: "_id",
            as: "bookDetails"
          }
        },
        { $unwind: { path: "$bookDetails", preserveNullAndEmptyArrays: true } },
        { $sort: { sales: -1 } },
        { $limit: 5 },
        {
          $project: {
            title: "$_id",
            author: { $ifNull: ["$bookDetails.author", "Unknown"] },
            sales: 1,
            revenue: 1
          }
        }
      ]);
    } catch (err) {
      console.error("Top Books aggregation failed:", err);
    }

    res.json({
      success: true,
      data: {
        metrics: {
          totalSales,
          totalOrders,
          totalCustomers,
          weeklyGrowth,
          dailyAverage,
        },
        monthlyData,
        topCategories,
        topBooks
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get weekly sales data (last 7 days)
// @route   GET /api/admin/dashboard/weekly-sales
// @access  Admin
export const getWeeklySales = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Get daily sales for the last 7 days
    const dailySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo, $lte: today },
          status: "approved"
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          sales: { $sum: "$total" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Create a map of dates to sales
    const salesMap = {};
    dailySales.forEach(item => {
      salesMap[item._id] = item.sales;
    });

    // Create array with all 7 days (fill missing days with 0)
    const result = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = dayNames[date.getDay()];
      
      result.push({
        day: dayName,
        sales: salesMap[dateStr] || 0,
        date: dateStr
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};
