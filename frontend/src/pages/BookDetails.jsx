import BookDetails from "../components/BookDetails";
import Suggestion from "../components/Suggestion";

const BookDetailsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-2 dark:bg-zinc-900">
      <BookDetails />
      <Suggestion title="You Can Also Like" />
    </div>
  );
};

export default BookDetailsPage;
