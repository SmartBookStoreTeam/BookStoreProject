import BookDetails from "../components/BookDetails";
import SimilarBooks from "../components/SimilarBooks";
import { useParams } from "react-router-dom";

const BookDetailsPage = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 pt-2 dark:bg-zinc-900">
      <BookDetails />
      <SimilarBooks bookId={id} />
    </div>
  );
};

export default BookDetailsPage;
