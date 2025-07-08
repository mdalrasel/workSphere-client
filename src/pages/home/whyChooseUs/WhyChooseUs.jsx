import React, { useEffect } from 'react';
import { Card } from 'flowbite-react';
import { FaShieldAlt, FaChartBar, FaMobileAlt, FaCloudUploadAlt } from 'react-icons/fa';
import AOS from 'aos';
import "aos/dist/aos.css";

const WhyChooseUs = () => {
  useEffect(() => {
    AOS.init({
      once: true,
      duration: 800,
      easing: 'ease-out',
    });
  }, []);

  const featuresData = [
    {
      id: 1,
      icon: <FaShieldAlt size={30} className="text-blue-600 dark:text-blue-400 mb-3" />,
      title: "Secure Data Management",
      description: "Keep your employee's sensitive data safe with state-of-the-art encryption and access controls."
    },
    {
      id: 2,
      icon: <FaChartBar size={30} className="text-lime-500 dark:text-lime-400 mb-3" />,
      title: "In-depth Analytics",
      description: "Get detailed reports and analytics on workflow and performance, aiding data-driven decisions."
    },
    {
      id: 3,
      icon: <FaMobileAlt size={30} className="text-indigo-500 dark:text-indigo-400 mb-3" />,
      title: "Mobile-Friendly Interface",
      description: "Access with ease from any device. Our responsive design allows you to work on the go."
    },
    {
      id: 4,
      icon: <FaCloudUploadAlt size={30} className="text-blue-600 dark:text-blue-400 mb-3" />,
      title: "Cloud-Based Solution",
      description: "Your data is securely stored in the cloud, making it accessible from anywhere and highly scalable."
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-extrabold text-center mb-12 text-white dark:text-white" data-aos="fade-up">
          Why Choose WorkSphere?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuresData.map((feature, index) => (
            <Card
              key={feature.id}
              className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1"
              data-aos="fade-up"
              data-aos-delay={`${index * 100}`}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
