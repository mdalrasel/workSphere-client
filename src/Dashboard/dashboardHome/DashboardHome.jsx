import React from 'react';
import useAuth from '../../hooks/useAuth';

const DashboardHome = () => {
    const { user } = useAuth();
    return (
           <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-900 dark:text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">
                স্বাগতম, {user?.displayName || 'ব্যবহারকারী'}!
            </h2>
            <p className="text-lg text-center text-gray-700 dark:text-gray-300 mb-8">
                আপনার WorkSphere ড্যাশবোর্ডে স্বাগতম। আপনার ভূমিকা অনুযায়ী আরও বিস্তারিত তথ্য এবং কার্যকারিতা দেখতে সাইডবার নেভিগেশন ব্যবহার করুন।
            </p>
            {/* এখানে আর কোনো ডাইনামিক পরিসংখ্যান দেখানো হবে না */}
        </div>
    );
};

export default DashboardHome;