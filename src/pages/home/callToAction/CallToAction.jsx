import React, { useEffect } from 'react';
import { Link } from 'react-router';
import AOS from 'aos'; 
import "aos/dist/aos.css";

const CallToAction = () => {
  useEffect(() => {
  }, []);

  return (
    <section className="py-20 md:py-32 bg-primary dark:bg-neutral-bg-dark text-white text-center rounded-lg mx-4 md:mx-auto max-w-6xl my-16 shadow-xl" data-aos="zoom-in">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight text-neutral-text-primary-dark">
          Empower Your Team with WorkSphere
        </h2>
        <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto opacity-90 text-neutral-text-primary-dark">
          Boost efficiency, improve communication, and unlock the full potential of your employees.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link
            to="/register"
            className="bg-accent text-neutral-text-primary-light px-8 py-4 rounded-full font-bold text-lg hover:bg-lime-600 transition-all duration-300 transform hover:scale-105 shadow-lg
                       dark:bg-accent-dark dark:text-neutral-text-primary-light dark:hover:bg-lime-500"
          >
            Get Started for Free
          </Link>
          <Link
            to="/contact-us"
            className="bg-neutral-bg-light text-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg
                       dark:bg-neutral-bg-section-dark dark:text-neutral-text-primary-dark dark:hover:bg-gray-600"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
