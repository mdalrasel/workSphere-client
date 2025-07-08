import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import ServiceCard from "../../../components/cards/ServicesCard";

const Services = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    AOS.init();
    fetch("/services.json")
      .then((res) => res.json())
      .then((data) => setServices(data));
  }, []);

  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-extrabold text-center mb-12 text-gray-900 dark:text-white" data-aos="fade-down">
          Our Core Services
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
