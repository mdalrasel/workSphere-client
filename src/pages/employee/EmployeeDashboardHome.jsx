// src/pages/dashboard/EmployeeDashboardHome.jsx
import React from 'react';
import { Link } from 'react-router';
import {  FaTasks, FaMoneyBillWave, FaUserCog, FaDollarSign, FaChartPie } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useUserRole from '../../hooks/useUserRole';
import { useQuery } from '@tanstack/react-query';

const EmployeeDashboardHome = () => {
    const { user, loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();
    const { role: loggedInUserRole, isLoading: roleLoading } = useUserRole();

    // Fetch dashboard statistics for Employee
    const { data: stats = {}, isLoading: statsLoading, error: statsError } = useQuery({
        queryKey: ['dashboard-stats-employee', loggedInUserRole],
        enabled: !!user?.email && !authLoading && !roleLoading && loggedInUserRole === 'Employee',
        queryFn: async () => {
            const res = await axiosSecure.get('/dashboard-stats');
            return res.data;
        },
    });

    if (authLoading || roleLoading || statsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
            </div>
        );
    }

    if (statsError) {
        return (
            <div className="text-red-500 text-center py-10">
                <p>ড্যাশবোর্ড পরিসংখ্যান লোড করতে সমস্যা হয়েছে: {statsError.message}</p>
            </div>
        );
    }

    // যদি লগইন করা ইউজার Employee না হয়, তাহলে Forbidden মেসেজ দেখান
    if (loggedInUserRole !== 'Employee') {
        return (
            <div className="text-red-500 text-center py-10">
                <h3 className="text-2xl font-bold">প্রবেশাধিকার নেই</h3>
                <p className="mt-2">এই পৃষ্ঠাটি শুধুমাত্র কর্মচারীদের জন্য উপলব্ধ।</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-900 dark:text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">
                স্বাগতম, {user?.displayName || 'কর্মচারী'}!
            </h2>
            <p className="text-lg text-center text-gray-700 dark:text-gray-300 mb-8">
                আপনার WorkSphere কর্মচারী ড্যাশবোর্ডে স্বাগতম। এখান থেকে আপনি আপনার ব্যক্তিগত কাজ এবং বেতনের তথ্য দেখতে পারবেন।
            </p>

            {/* Employee Specific Statistics */}
            <h3 className="text-2xl font-bold mb-4 text-center">আমার পরিসংখ্যান</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <div className="bg-blue-100 dark:bg-blue-900 p-6 rounded-lg shadow-lg flex items-center">
                    <FaTasks className="text-blue-600 dark:text-blue-400 mr-4" size={40} />
                    <div>
                        <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200">আমার মোট ওয়ার্কশীট</h3>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.myTotalWorksheets}</p>
                    </div>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-6 rounded-lg shadow-lg flex items-center">
                    <FaMoneyBillWave className="text-green-600 dark:text-green-400 mr-4" size={40} />
                    <div>
                        <h3 className="text-xl font-semibold text-green-800 dark:text-green-200">আমার মোট পরিশোধিত বেতন</h3>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">${stats.myTotalSalaryPaid?.toFixed(2)}</p>
                    </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 p-6 rounded-lg shadow-lg flex items-center">
                    <FaDollarSign className="text-purple-600 dark:text-purple-400 mr-4" size={40} />
                    <div>
                        <h3 className="text-xl font-semibold text-purple-800 dark:text-purple-200">আমার প্রত্যাশিত বেতন</h3>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">${stats.myExpectedSalary?.toFixed(2)}</p>
                    </div>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900 p-6 rounded-lg shadow-lg flex items-center">
                    <FaChartPie className="text-yellow-600 dark:text-yellow-400 mr-4" size={40} />
                    <div>
                        <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200">আমার মোট পেমেন্ট</h3>
                        <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.myTotalPayments}</p>
                    </div>
                </div>
            </div>

            {/* Navigation Cards */}
            <h3 className="text-2xl font-bold mb-4 text-center">দ্রুত অ্যাক্সেস</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* My WorkSheet Card */}
                <Link to="/dashboard/my-work-sheet" className="block p-6 bg-blue-100 dark:bg-blue-900 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 text-center transform hover:scale-105">
                    <FaTasks className="text-blue-600 dark:text-blue-400 mx-auto mb-4" size={48} />
                    <h3 className="text-xl font-semibold mb-2 text-blue-800 dark:text-blue-200">আমার ওয়ার্কশীট</h3>
                    <p className="text-gray-700 dark:text-gray-300">আপনার দৈনিক কাজের বিবরণ জমা দিন এবং দেখুন।</p>
                </Link>

                {/* My Payment History Card */}
                <Link to="/dashboard/my-payment-history" className="block p-6 bg-green-100 dark:bg-green-900 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 text-center transform hover:scale-105">
                    <FaMoneyBillWave className="text-green-600 dark:text-green-400 mx-auto mb-4" size={48} />
                    <h3 className="text-xl font-semibold mb-2 text-green-800 dark:text-green-200">আমার পেমেন্ট ইতিহাস</h3>
                    <p className="text-gray-700 dark:text-gray-300">আপনার বেতনের পরিশোধিত ইতিহাস পর্যালোচনা করুন।</p>
                </Link>

                {/* Your Profile Card */}
                <Link to="/dashboard/profile" className="block p-6 bg-yellow-100 dark:bg-yellow-900 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 text-center transform hover:scale-105">
                    <FaUserCog className="text-yellow-600 dark:text-yellow-400 mx-auto mb-4" size={48} />
                    <h3 className="text-xl font-semibold mb-2 text-yellow-800 dark:text-yellow-200">আমার প্রোফাইল</h3>
                    <p className="text-gray-700 dark:text-gray-300">আপনার ব্যক্তিগত প্রোফাইল তথ্য দেখুন এবং আপডেট করুন।</p>
                </Link>
            </div>
        </div>
    );
};

export default EmployeeDashboardHome;
