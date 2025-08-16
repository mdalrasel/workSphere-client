import Banner from "./banner/Banner";
import EmployeeStats from "./employeeStats/EmployeeStats";
import HowItWorks from "./howItWorks/HowItWorks";
import LatestNews from "./latestNews/LatestNews";
import Services from "./services/Services";
import TaskOverview from "./TaskOverview/TaskOverview";
import Testimonials from "./testimonials/Testimonials";
import QuickActions from "./UpcomingEvents/UpcomingEvents";
import WhyChooseUs from "./whyChooseUs/WhyChooseUs";


const Home = () => {
    return (
        <div>
            <Banner />
            <Services />
            <WhyChooseUs />
            <HowItWorks />
            <LatestNews />
            <EmployeeStats />
            <TaskOverview />
            <QuickActions />
            <Testimonials />
        </div>
    );
};

export default Home;