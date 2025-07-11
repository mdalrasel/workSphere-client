import React from 'react';
import { Link } from 'react-router';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaGithub } from 'react-icons/fa';
import WorkSphereLogo from '../../utils/WorkSphereLogo';

const Footer = () => {
  return (
    <footer className=" py-8 mt-12 rounded-t-lg">
      <div className=" px-4">
        <div className="md:flex md:justify-between md:items-start gap-8">
          {/* Logo and company description */}
          <div className="mb-6 md:mb-0 md:w-1/3">
            <Link to="/" className="flex  p-2 rounded-md items-center mb-4">
              <WorkSphereLogo />
            </Link>
            <p className=" text-sm leading-relaxed">
              Simplify your employee management. WorkSphere is a powerful platform for tracking your workflow, salaries, and contracts.
            </p>
          </div>

          {/* Links section */}
          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3 md:w-2/3">
            {/* Company links */}
            <div>
              <h2 className="mb-6 text-sm font-semibold  uppercase ">Company</h2>
              <ul className=" font-medium">
                <li className="mb-4">
                  <Link  className="hover:underline">About Us</Link>
                </li>
                <li className="mb-4">
                  <Link  className="hover:underline">Careers</Link>
                </li>
                <li className="mb-4">
                  <Link  className="hover:underline">Blog</Link>
                </li>
              </ul>
            </div>
            {/* Resource links */}
            <div>
              <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase ">Resources</h2>
              <ul className=" font-medium">
                <li className="mb-4">
                  <Link  className="hover:underline">Features</Link>
                </li>
                <li className="mb-4">
                  <Link  className="hover:underline">Pricing</Link>
                </li>
                <li className="mb-4">
                  <Link  className="hover:underline">Support</Link>
                </li>
              </ul>
            </div>
            {/* Legal links */}
            <div>
              <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase ">Legal</h2>
              <ul className=" font-medium">
                <li className="mb-4">
                  <Link  className="hover:underline">Privacy Policy</Link>
                </li>
                <li className="mb-4">
                  <Link  className="hover:underline">Terms & Conditions</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="my-6 border-gray-300 dark:border-gray-700 sm:mx-auto lg:my-8" />

        {/* Copyright and Social Media */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm  sm:text-center">
            © {new Date().getFullYear()} <Link to="/" className="hover:underline">WorkSphere™</Link>. All Rights Reserved.
          </span>
          <div className="flex mt-4 space-x-5 sm:justify-center sm:mt-0">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <FaFacebookF size={20} />
              <span className="sr-only">Facebook page</span>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-400 dark:hover:text-blue-300 transition-colors">
              <FaTwitter size={20} />
              <span className="sr-only">Twitter page</span>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">
              <FaInstagram size={20} />
              <span className="sr-only">Instagram page</span>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-700 dark:hover:text-blue-500 transition-colors">
              <FaLinkedinIn size={20} />
              <span className="sr-only">LinkedIn page</span>
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors">
              <FaGithub size={20} />
              <span className="sr-only">GitHub account</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
