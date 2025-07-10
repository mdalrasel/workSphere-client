// src/pages/dashboard/EmployeeHome.jsx
import React from 'react';
import useAuth from '../../hooks/useAuth';

const EmployeeHome = () => {
    const { user, loading } = useAuth(); 

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-900 dark:text-white">
            <h1 className="text-3xl font-bold mb-4 text-center">
                স্বাগতম, {user?.displayName || "কর্মচারী"}!
            </h1>
            <p className="text-lg text-center text-gray-700 dark:text-gray-300">
                আপনার WorkSphere ড্যাশবোর্ডে স্বাগতম। এখানে আপনি আপনার কাজের বিবরণ এবং পেমেন্টের ইতিহাস দেখতে পারবেন।
            </p>
            <p className="text-md text-center mt-4 text-gray-600 dark:text-gray-400">
                বাম পাশের সাইডবার থেকে আপনার প্রয়োজনীয় অপশনগুলো বেছে নিন।
            </p>
            {/* আপনি এখানে Employee-এর জন্য প্রাসঙ্গিক কিছু ওভারভিউ ডেটা বা কার্ড যোগ করতে পারেন */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* উদাহরণ কার্ড: মোট কাজ */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-lg shadow-sm border border-blue-200 dark:border-blue-700">
                    <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-2">মোট কাজ জমা দিয়েছেন</h3>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">১০</p> {/* ডামি ডেটা */}
                    <p className="text-sm text-gray-600 dark:text-gray-400">এই মাসে</p>
                </div>
                {/* উদাহরণ কার্ড: মোট ঘন্টা */}
                <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-lg shadow-sm border border-green-200 dark:border-green-700">
                    <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">মোট কাজের ঘন্টা</h3>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">৮০</p> {/* ডামি ডেটা */}
                    <p className="text-sm text-gray-600 dark:text-gray-400">এই মাসে</p>
                </div>
                {/* উদাহরণ কার্ড: পরবর্তী পেমেন্ট */}
                <div className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-lg shadow-sm border border-purple-200 dark:border-purple-700">
                    <h3 className="text-xl font-semibold text-purple-800 dark:text-purple-200 mb-2">পরবর্তী পেমেন্ট</h3>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">$১৫০০</p> {/* ডামি ডেটা */}
                    <p className="text-sm text-gray-600 dark:text-gray-400">জুলাই ২০২৫</p>
                </div>
            </div>
        </div>
    );
};

export default EmployeeHome;
