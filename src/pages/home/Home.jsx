import Banner from "./banner/Banner";
import HowItWorks from "./howItWorks/HowItWorks";
import LatestNews from "./latestNews/LatestNews";
import Services from "./services/Services";
import Testimonials from "./testimonials/Testimonials";
import WhyChooseUs from "./whyChooseUs/WhyChooseUs";


const Home = () => {
    return (
        <div>
            <Banner />
            <Services />
            <WhyChooseUs />
            <HowItWorks />
            <LatestNews />
            <Testimonials />
        </div>
    );
};

export default Home;