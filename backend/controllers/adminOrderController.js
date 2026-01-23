import Order from "../models/Order.js";
import LibraryItem from "../models/LibraryItem.js";
import Book from "../models/Book.js";

export const getAdminOrders = async (req, res, next) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.page) || 1;
    const status = req.query.status;

    const filter = {};
    if (status) filter.status = status;

    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate("user", "name email role")
      .populate("items.book", "title author price")
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      success: true,
      data: orders,
      meta: { page, pageSize, total, pages: Math.ceil(total / pageSize) },
    });
  } catch (err) {
    next(err);
  }
};

export const approveOrder = async (req, res, next) => {
  try {
    const { note } = req.body || {};
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    if (order.status !== "requested") {
      return res
        .status(400)
        .json({ success: false, message: "Order is not in requested status" });
    }

    order.status = "approved";
    order.approvedAt = new Date();
    order.adminNote = note || "";
    await order.save();

    // Create library ownership for each book in the order
    for (const item of order.items) {
      await LibraryItem.updateOne(
        { user: order.user, book: item.book },
        {
          $setOnInsert: {
            user: order.user,
            book: item.book,
            order: order._id,
            accessStatus: "active",
            purchasedAt: new Date(),
          },
        },
        { upsert: true }
      );

      await Book.updateOne({ _id: item.book }, { $inc: { sales: 1 } });
    }

    res.json({
      success: true,
      message: "Order approved",
      data: { orderId: order._id },
    });
  } catch (err) {
    next(err);
  }
};

export const rejectOrder = async (req, res, next) => {
  try {
    const { note } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    if (order.status !== "requested") {
      return res
        .status(400)
        .json({ success: false, message: "Order is not in requested status" });
    }

    order.status = "rejected";
    order.rejectedAt = new Date();
    order.adminNote = note || "";
    await order.save();

    res.json({
      success: true,
      message: "Order rejected",
      data: { orderId: order._id },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete an order
// @route   DELETE /api/admin/orders/:id
// @access  Admin
export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }
    
    await Order.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true, 
      message: "Order deleted successfully" 
    });
  } catch (error) {
    next(error);
  }
};
