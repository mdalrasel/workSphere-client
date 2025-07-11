import {  Outlet } from 'react-router';
import { useState } from 'react';
import { FaBars } from 'react-icons/fa';
import Sidebar from '../components/sidebar/Sidebar';
import useAuth from '../hooks/useAuth';

const DashboardLayout = () => {
  const {user}=useAuth()
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 bg-gray-800 text-white w-64 z-50`}>
        <Sidebar />
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0  z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col ">
        {/* Top Navbar */}
        <div className="p-4 bg-blue-100 flex items-center justify-between lg:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className=""
          >
            <FaBars size={24} />
          </button>
          <h3 className='font-bold'>{ user?.displayName  } !</h3>
          

        </div>

        <div className="p-4 flex-grow">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
