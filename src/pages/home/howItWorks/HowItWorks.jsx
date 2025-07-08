import React, { useEffect } from 'react';
import { Card } from 'flowbite-react'; 
import { FaUserPlus, FaUsersCog, FaTasks, FaChartLine } from 'react-icons/fa';
import AOS from 'aos'; 
import "aos/dist/aos.css"; 

const HowItWorks = () => {
  useEffect(() => {
    AOS.init({
      once: true,
      duration: 800,
      easing: 'ease-out',
    });
  }, []);

  const stepsData = [
    {
      id: 1,
      icon: <FaUserPlus size={30} className="text-primary dark:text-blue-400 mb-3" />,
      title: "1. Register & Onboard",
      description: "Sign up as an Employee or HR. Easily onboard your team members and set up their profiles."
    },
    {
      id: 2,
      icon: <FaUsersCog size={30} className="text-secondary dark:text-indigo-400 mb-3" />,
      title: "2. Manage Employees",
      description: "HR and Admin can manage employee details, verify accounts, and assign roles."
    },
    {
      id: 3,
      icon: <FaTasks size={30} className="text-accent dark:text-lime-400 mb-3" />,
      title: "3. Track Workflow",
      description: "Employees can submit daily tasks and hours worked. HR can monitor progress efficiently."
    },
    {
      id: 4,
      icon: <FaChartLine size={30} className="text-primary dark:text-blue-400 mb-3" />,
      title: "4. Gain Insights",
      description: "Access detailed reports on payroll, performance, and workload to make informed decisions."
    }
  ];

  return (
   <section className="py-16 md:py-24 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
  <div className="container mx-auto px-4">
    <h2 className="text-4xl font-extrabold text-center mb-12 text-white dark:text-white" data-aos="fade-up">
      How WorkSphere Works
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {stepsData.map((step, index) => (
        <Card
          key={step.id}
          className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1"
          data-aos="fade-up"
          data-aos-delay={`${index * 150}`}
        >
          <div className="mb-4">{step.icon}</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {step.title}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            {step.description}
          </p>
        </Card>
      ))}
    </div>
  </div>
</section>
  );
};

export default HowItWorks;
