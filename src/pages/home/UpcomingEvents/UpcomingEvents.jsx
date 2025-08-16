import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaGift, FaSuitcase, FaExclamationCircle } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    AOS.init({ once: true, duration: 800, easing: 'ease-out' });
    setEvents([
      {
        id: 1,
        title: "Company Holiday (Eid-ul-Adha)",
        date: "2025-08-10",
        type: "holiday",
        icon: <FaGift className="text-pink-500" />,
      },
      {
        id: 2,
        title: "Q3 Performance Review",
        date: "2025-08-25",
        type: "review",
        icon: <FaSuitcase className="text-indigo-500" />,
      },
      {
        id: 3,
        title: "Marketing Team Meeting",
        date: "2025-08-28",
        type: "meeting",
        icon: <FaCalendarAlt className="text-yellow-500" />,
      },
      {
        id: 4,
        title: "Project Alpha Deadline",
        date: "2025-09-05",
        type: "deadline",
        icon: <FaExclamationCircle className="text-red-500" />,
      },
    ]);
  }, []);

  return (
    <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-900 dark:text-white" data-aos="fade-down">
          Upcoming Events & Reminders
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((event, index) => (
            <div
              key={event.id}
              className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 flex items-center space-x-4 transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
              data-aos="fade-up"
              data-aos-delay={`${index * 150}`}
            >
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-opacity-10 dark:bg-opacity-20">
                {event.icon}
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(event.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;