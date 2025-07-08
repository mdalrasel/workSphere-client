import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import AOS from 'aos';
import "aos/dist/aos.css";

const testimonials = [
  {
    id: 1,
    name: "John Doe",
    role: "Product Manager",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    quote: "WorkSphere transformed our employee management. Easy to use, powerful, and reliable platform!"
  },
  {
    id: 2,
    name: "Sarah Smith",
    role: "HR Lead",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    quote: "Payroll and contract tracking have never been smoother. I highly recommend WorkSphere!"
  },
  {
    id: 3,
    name: "Michael Johnson",
    role: "CEO",
    photo: "https://randomuser.me/api/portraits/men/85.jpg",
    quote: "The performance analytics help us identify and improve team productivity effectively."
  },
  {
    id: 4,
    name: "Emily White",
    role: "Marketing Director",
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
    quote: "The intuitive interface and robust features of WorkSphere have significantly boosted our team's productivity."
  }
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isForward, setIsForward] = useState(true); 
  const slideInterval = 5000;

  useEffect(() => {
    AOS.init({
      once: true,
      duration: 800,
      easing: 'ease-out',
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        if (isForward) {
          if (prevIndex === testimonials.length - 1) {
            setIsForward(false);
            return prevIndex - 1;
          }
          return prevIndex + 1;
        } else {
          if (prevIndex === 0) {
            setIsForward(true);
            return prevIndex + 1;
          }
          return prevIndex - 1;
        }
      });
    }, slideInterval);

    return () => clearInterval(interval);
  }, [isForward]);

  const goToNext = () => {
    setCurrentIndex((prev) => {
      if (prev === testimonials.length - 1) {
        setIsForward(false);
        return prev - 1;
      }
      setIsForward(true);
      return prev + 1;
    });
  };

  

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsForward(index >= currentIndex); // detect direction
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-gray-800 dark:via-gray-700 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-extrabold text-center mb-12 text-white" data-aos="fade-up">
          What Our Clients Say
        </h2>

        <div
          className="relative max-w-4xl mx-auto h-[400px] md:h-[450px] lg:h-[500px] rounded-lg shadow-xl overflow-hidden bg-white dark:bg-gray-800"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <div
            className="flex h-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="w-full flex-shrink-0 flex flex-col items-center justify-center p-8 text-center"
              >
                <img
                  src={testimonial.photo}
                  alt={testimonial.name}
                  className="w-24 h-24 rounded-full object-cover mb-6 border-4 border-blue-600 dark:border-purple-500"
                />
                <p className="text-lg md:text-xl italic mb-4 text-gray-700 dark:text-gray-300 max-w-2xl">
                  “{testimonial.quote}”
                </p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{testimonial.name}</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</span>
              </div>
            ))}
          </div>

          <button
           
            className="absolute top-1/2 left-4 -translate-y-1/2 p-3 rounded-full bg-white/70 hover:bg-white text-gray-700 transition-colors z-10 dark:bg-gray-700/70 dark:hover:bg-gray-600 dark:text-white"
            aria-label="Previous testimonial"
          >
            <FaChevronLeft size={20} />
          </button>
          <button
            onClick={goToNext}
            className="absolute top-1/2 right-4 -translate-y-1/2 p-3 rounded-full bg-white/70 hover:bg-white text-gray-700 transition-colors z-10 dark:bg-gray-700/70 dark:hover:bg-gray-600 dark:text-white"
            aria-label="Next testimonial"
          >
            <FaChevronRight size={20} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${index === currentIndex ? 'bg-blue-600 dark:bg-purple-400' : 'bg-gray-400 dark:bg-gray-600 hover:bg-gray-500 dark:hover:bg-gray-500'}`}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
