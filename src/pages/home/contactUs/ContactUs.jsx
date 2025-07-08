import React, { useEffect } from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';

const ContactUs = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
      <div className="container mx-auto px-4 space-y-12">
        <h2 className="text-5xl font-extrabold text-center" data-aos="fade-up">
          Get in Touch With Us
        </h2>

        {/* Contact Info + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8" data-aos="fade-right">
            <div className="flex items-center space-x-4">
              <FaPhoneAlt className="text-3xl text-white" />
              <div>
                <h4 className="font-bold text-lg">Phone</h4>
                <p>+880 1234 567 890</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <FaEnvelope className="text-3xl text-white" />
              <div>
                <h4 className="font-bold text-lg">Email</h4>
                <p>contact@worksphere.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <FaMapMarkerAlt className="text-3xl text-white" />
              <div>
                <h4 className="font-bold text-lg">Address</h4>
                <p>Dhaka, Bangladesh</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-8 rounded-lg shadow-lg space-y-6"
            data-aos="fade-left"
          >
            <div>
              <label className="block font-semibold mb-2">Name</label>
              <input type="text" placeholder="Your Name" className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block font-semibold mb-2">Email</label>
              <input type="email" placeholder="Your Email" className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block font-semibold mb-2">Message</label>
              <textarea rows="4" placeholder="Your Message" className="w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500" required></textarea>
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105">
              Send Message
            </button>
          </form>
        </div>

        {/* Map */}
        <div className="rounded-lg overflow-hidden shadow-lg" data-aos="fade-up">
          <iframe
            title="Company Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.511985330678!2d90.39208711543136!3d23.800847492999673!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c77d5c6eb2c1%3A0x7d90c0b7604c5aa3!2sDhaka!5e0!3m2!1sen!2sbd!4v1629970601002!5m2!1sen!2sbd"
            width="100%"
            height="400"
            allowFullScreen=""
            loading="lazy"
            className="border-0 w-full"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
