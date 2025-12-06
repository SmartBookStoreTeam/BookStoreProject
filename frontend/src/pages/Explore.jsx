import LandingExplore from "../components/LandingExplore";
import Popular from "../components/Popular";
import Releases from "../components/Releases";
import Suggetion from "../components/Suggetion";
import TopRated from "../components/TopRated";

const Explore = () => {
  return <div>
    <LandingExplore />
    <Releases />
    <TopRated />
    <Suggetion />
    <Popular />
  </div>;
};

export default Explore;
