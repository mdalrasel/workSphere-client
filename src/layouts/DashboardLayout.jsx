import { Outlet } from 'react-router';
import { useState } from 'react';
import { FaBars } from 'react-icons/fa';
import Sidebar from '../components/sidebar/Sidebar';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../utils/LoadingSpinner';
import usePageTitle from '../hooks/usePageTitle';
import { Helmet } from 'react-helmet-async';

const DashboardLayout = () => {
    const pageTitle = usePageTitle();
    const { loading } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (loading) {
        return (
           <LoadingSpinner />
        );
    }

    return (
        <div className="flex min-h-screen">
             <Helmet>
                <title>{pageTitle}</title>
            </Helmet>
            <div
                className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 
                bg-gray-800 text-white min-w-64 z-50 min-h-screen overflow-y-auto pb-20`}
            >
                <Sidebar />
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)} 
                ></div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                <div className="sticky top-0 z-10 p-4 bg-white dark:bg-gray-800 shadow-md flex items-center justify-between lg:hidden">
                    <button
                        onClick={() => setIsOpen(!isOpen)} 
                        className="text-gray-800 dark:text-white"
                    >
                        <FaBars size={24} />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
                </div>

                
                <div className="flex-1 h-screen overflow-y-auto overflow-x-auto px-4 py-6 bg-gray-100 dark:bg-gray-900">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
