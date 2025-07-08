import { Link } from "react-router";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const Banner = () => {
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <section className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] flex items-center justify-center text-white overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://placehold.co/1920x1080/2563EB/ffffff?text=WorkSphere+Success')" }}
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-blue-600 opacity-80 dark:bg-gray-900 dark:opacity-90"></div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 text-center">
        {/* Headline */}
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
          data-aos="fade-up"
          data-aos-duration="800"
        >
          Simplify Your Workflow
        </h1>

        {/* Tagline */}
        <p
          className="text-lg md:text-xl lg:text-2xl mb-10 max-w-4xl mx-auto opacity-90"
          data-aos="fade-up"
          data-aos-delay="200"
          data-aos-duration="800"
        >
          WorkSphere: A powerful and modern platform for employee management, payroll, and contract tracking.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6"
          data-aos="fade-up"
          data-aos-delay="400"
          data-aos-duration="800"
        >
          <Link
            to="/dashboard"
            className="bg-blue-500 text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg dark:bg-blue-400 dark:text-gray-900 dark:hover:bg-blue-500"
          >
            Get Started Now
          </Link>

          <Link
            to="/features"
            className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Explore Features
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Banner;
