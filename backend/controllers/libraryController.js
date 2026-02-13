import LibraryItem from "../models/LibraryItem.js";

// @desc    Get my library (purchased books)
// @route   GET /api/orders/my-library
// @access  Private
export const getMyLibrary = async (req, res, next) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Fetch all active library items for the user
    const libraryItems = await LibraryItem.find({
      user: userId,
      accessStatus: "active",
    })
      .populate({
        path: "book",
        select:
          "title author price image pdf description category ratingAvg ratingCount sales isActive",
      })
      .sort({ purchasedAt: -1 });

    // Filter out items where book was deleted or is no longer active
    const books = libraryItems
      .filter((item) => item.book && item.book.isActive !== false)
      .map((item) => ({
        _id: item.book._id,
        title: item.book.title,
        author: item.book.author,
        price: item.book.price,
        image: item.book.image,
        img: item.book.image,
        images: item.book.image ? [item.book.image] : [],
        pdf: item.book.pdf,
        description: item.book.description,
        category: item.book.category,
        ratingAvg: item.book.ratingAvg,
        ratingCount: item.book.ratingCount,
        sales: item.book.sales,
        purchasedAt: item.purchasedAt,
      }));

    res.json({
      success: true,
      data: books,
    });
  } catch (err) {
    next(err);
  }
};
