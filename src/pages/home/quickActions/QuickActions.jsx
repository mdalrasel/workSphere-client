import React, { useEffect } from 'react';
import { FaPlus, FaCalendarCheck, FaFileAlt, FaChartLine } from 'react-icons/fa';
import { Link } from 'react-router';
import AOS from 'aos';
import 'aos/dist/aos.css';

const QuickActions = () => {
  useEffect(() => {
    AOS.init({ once: true, duration: 800, easing: 'ease-out' });
  }, []);

  const actionItems = [
    {
      title: "Add New Employee",
      description: "Quickly onboard a new team member to the system.",
      icon: <FaPlus size={28} />,
      link: "/dashboard/add-employee",
      color: "bg-blue-600",
    },
    {
      title: "Request Leave",
      description: "Submit a new leave application for approval.",
      icon: <FaCalendarCheck size={28} />,
      link: "/dashboard/leave-request",
      color: "bg-purple-600",
    },
    {
      title: "View Reports",
      description: "Access detailed payroll and performance reports.",
      icon: <FaChartLine size={28} />,
      link: "/dashboard/reports",
      color: "bg-teal-600",
    },
    {
      title: "Manage Contracts",
      description: "Review and update employee contracts.",
      icon: <FaFileAlt size={28} />,
      link: "/dashboard/contracts",
      color: "bg-orange-600",
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-900 dark:text-white" data-aos="fade-down">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {actionItems.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className={`flex flex-col items-center p-6 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-1 ${action.color} text-white`}
              data-aos="fade-up"
              data-aos-delay={`${index * 150}`}
            >
              <div className="mb-4">
                {action.icon}
              </div>
              <h3 className="text-lg font-bold text-center mb-2">
                {action.title}
              </h3>
              <p className="text-sm text-center opacity-80">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickActions;