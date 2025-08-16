import React, { useState, useEffect } from "react";
import { FaUsers, FaUserPlus, FaCheckCircle } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

const EmployeeStats = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    newHires: 0,
    activeToday: 0,
  });

  useEffect(() => {
    AOS.init({ once: true, duration: 800, easing: 'ease-out' });
    // In a real application, you would fetch this data from an API
    // fetch('/api/employee-stats')
    //   .then(res => res.json())
    //   .then(data => setStats(data));

    // For now, using mock data
    setStats({
      totalEmployees: 150,
      newHires: 5,
      activeToday: 145,
    });
  }, []);

  const statItems = [
    {
      icon: <FaUsers size={24} className="text-white" />,
      label: "Total Employees",
      value: stats.totalEmployees,
      bgColor: "bg-blue-500",
    },
    {
      icon: <FaUserPlus size={24} className="text-white" />,
      label: "New Hires (This Month)",
      value: stats.newHires,
      bgColor: "bg-lime-500",
    },
    {
      icon: <FaCheckCircle size={24} className="text-white" />,
      label: "Active Today",
      value: stats.activeToday,
      bgColor: "bg-purple-500",
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-900 dark:text-white" data-aos="fade-down">
          Current Workforce Snapshot
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statItems.map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center space-x-4 transition-transform transform hover:-translate-y-1"
              data-aos="fade-up"
              data-aos-delay={`${index * 150}`}
            >
              <div className={`p-4 rounded-full ${item.bgColor}`}>
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {item.label}
                </p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {item.value}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EmployeeStats;