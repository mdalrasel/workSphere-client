import { FaTasks, FaDollarSign, FaFileContract, FaChartLine, FaUsers, FaHandshake } from "react-icons/fa";

const ServiceCard = ({ service, index }) => {
  const icons = [FaTasks, FaDollarSign, FaFileContract, FaChartLine, FaUsers, FaHandshake];
  const Icon = icons[index] || FaTasks;

  return (
    <div
      data-aos="fade-up"
      data-aos-delay={index * 100}
      className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex justify-center items-center mb-6">
        <Icon size={40} className={`text-${service.color} dark:text-${service.color}`} />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">
        {service.title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-center">
        {service.description}
      </p>
    </div>
  );
};

export default ServiceCard;
