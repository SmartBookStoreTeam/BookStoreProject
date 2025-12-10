import LandingExplore from "../components/LandingExplore";
import Popular from "../components/Popular";
import Releases from "../components/Releases";
import Suggestion from "../components/Suggestion";
import TopRated from "../components/TopRated";

const Explore = () => {
  return <div>
    <LandingExplore />
    <Releases />
    <TopRated />
    <Suggestion />
    <Popular />
  </div>;
};

export default Explore;
