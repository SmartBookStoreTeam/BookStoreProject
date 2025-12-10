import { useCart } from "../hooks/useCart";
import { Trash2, ShoppingCart } from "lucide-react";

const UserBooks = () => {
  const { userBooks, removeUserBook, addToCart } = useCart();

  // Helper function to get image source
  const getImageSrc = (image) => {
    if (image.base64) {
      return image.base64; // Base64 string
    } else if (image.preview) {
      return image.preview; // Blob URL (temporary)
    } else if (image.url) {
      return image.url; // External URL
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-20 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Community Books</h1>
          <span className="text-gray-600">{userBooks.length} books listed</span>
        </div>

        {userBooks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 text-lg mb-4">No books listed yet.</p>
            <p className="text-gray-400">Be the first to list a book!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {userBooks.map((book) => {
              const imageSrc = book.images && book.images.length > 0 
                ? getImageSrc(book.images[0]) 
                : null;

              return (
                <div
                  key={book.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Book Image */}
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={book.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}

                  {/* Fallback in case image fails to load */}
                  <div 
                    className="w-full h-48 bg-gray-200 flex items-center justify-center hidden"
                    style={{ display: imageSrc ? 'none' : 'flex' }}
                  >
                    <span className="text-gray-400">No Image</span>
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1 mr-2">
                        {book.title}
                      </h3>
                      <button
                        onClick={() => removeUserBook(book.id)}
                        className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                        title="Remove book"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">by {book.author}</p>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-green-600 font-bold text-lg">
                        ₹{book.price}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">
                        {book.condition}
                      </span>
                    </div>

                    {book.description && (
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                        {book.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span className="capitalize">{book.category}</span>
                      <span>{new Date(book.listedAt).toLocaleDateString()}</span>
                    </div>

                    <button
                      onClick={() => addToCart(book)}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <ShoppingCart size={16} />
                      Add to Cart
                    </button>

                    <div className="mt-2 text-xs text-gray-500">
                      <p>Seller: {book.sellerName}</p>
                      <p>Location: {book.sellerLocation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBooks;