import SellerBooks from "../components/SellerBooks";
import FavoriteBooks from "../components/FavoriteBooks";
import Landing from "../components/Landing";
import NationalBook from "../components/NationalBook";
import Releases from "../components/Releases";
import UserBooks from "../components/UserBooks";

const Home = () => {
  return (
    <div>
      <Landing />
      <SellerBooks />
      <FavoriteBooks />
      <NationalBook />
      <UserBooks />
      <Releases />
    </div>
  );
};

export default Home;
