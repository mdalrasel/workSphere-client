import { Link } from 'react-router';
import { FaUsers, FaTasks, FaMoneyBillWave, FaDollarSign, FaHourglassHalf, FaUserTie, FaUserShield, FaUserFriends, FaChartPie, FaHome, FaUserCog } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useUserRole from '../../hooks/useUserRole';
import { useQuery } from '@tanstack/react-query';

const AdminDashboardHome = () => {
    const { user, loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();
    const { role: loggedInUserRole, isLoading: roleLoading } = useUserRole();

    // Fetch dashboard statistics for Admin
    const { data: stats = {}, isLoading: statsLoading, error: statsError } = useQuery({
        queryKey: ['dashboard-stats-admin', loggedInUserRole],
        enabled: !!user?.email && !authLoading && !roleLoading && loggedInUserRole === 'Admin',
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

    // যদি লগইন করা ইউজার অ্যাডমিন না হয়, তাহলে Forbidden মেসেজ দেখান
    if (loggedInUserRole !== 'Admin') {
        return (
            <div className="text-red-500 text-center py-10">
                <h3 className="text-2xl font-bold">প্রবেশাধিকার নেই</h3>
                <p className="mt-2">এই পৃষ্ঠাটি শুধুমাত্র অ্যাডমিনদের জন্য উপলব্ধ।</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-900 dark:text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">
                স্বাগতম, {user?.displayName || 'অ্যাডমিন'}!
            </h2>
            <p className="text-lg text-center text-gray-700 dark:text-gray-300 mb-8">
                আপনার WorkSphere অ্যাডমিন ড্যাশবোর্ডে স্বাগতম। এখান থেকে আপনি সিস্টেমের সামগ্রিক কর্মক্ষমতা নিরীক্ষণ এবং ব্যবহারকারী ও বেতন ব্যবস্থাপনা পরিচালনা করতে পারবেন।
            </p>

            {/* Admin Specific Statistics */}
            <h3 className="text-2xl font-bold mb-4 text-center">অ্যাডমিন পরিসংখ্যান</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <div className="bg-blue-100 dark:bg-blue-900 p-6 rounded-lg shadow-lg flex items-center">
                    <FaUsers className="text-blue-600 dark:text-blue-400 mr-4" size={40} />
                    <div>
                        <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200">মোট ব্যবহারকারী</h3>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalUsers}</p>
                    </div>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-6 rounded-lg shadow-lg flex items-center">
                    <FaUserTie className="text-green-600 dark:text-green-400 mr-4" size={40} />
                    <div>
                        <h3 className="text-xl font-semibold text-green-800 dark:text-green-200">মোট কর্মচারী</h3>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.totalEmployees}</p>
                    </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 p-6 rounded-lg shadow-lg flex items-center">
                    <FaUserFriends className="text-purple-600 dark:text-purple-400 mr-4" size={40} />
                    <div>
                        <h3 className="text-xl font-semibold text-purple-800 dark:text-purple-200">মোট এইচআর</h3>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.totalHRs}</p>
                    </div>
                </div>
                <div className="bg-red-100 dark:bg-red-900 p-6 rounded-lg shadow-lg flex items-center">
                    <FaUserShield className="text-red-600 dark:text-red-400 mr-4" size={40} />
                    <div>
                        <h3 className="text-xl font-semibold text-red-800 dark:text-red-200">মোট অ্যাডমিন</h3>
                        <p className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.totalAdmins}</p>
                    </div>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900 p-6 rounded-lg shadow-lg flex items-center">
                    <FaTasks className="text-yellow-600 dark:text-yellow-400 mr-4" size={40} />
                    <div>
                        <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200">মোট ওয়ার্কশীট</h3>
                        <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.totalWorksheets}</p>
                    </div>
                </div>
                <div className="bg-teal-100 dark:bg-teal-900 p-6 rounded-lg shadow-lg flex items-center">
                    <FaMoneyBillWave className="text-teal-600 dark:text-teal-400 mr-4" size={40} />
                    <div>
                        <h3 className="text-xl font-semibold text-teal-800 dark:text-teal-200">মোট পরিশোধিত বেতন</h3>
                        <p className="text-2xl font-bold text-teal-900 dark:text-teal-100">${stats.totalSalaryPaid?.toFixed(2)}</p>
                    </div>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900 p-6 rounded-lg shadow-lg flex items-center">
                    <FaHourglassHalf className="text-orange-600 dark:text-orange-400 mr-4" size={40} />
                    <div>
                        <h3 className="text-xl font-semibold text-orange-800 dark:text-orange-200">পেন্ডিং পেমেন্ট রিকোয়েস্ট</h3>
                        <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.totalPendingPaymentRequests}</p>
                    </div>
                </div>
                <div className="bg-indigo-100 dark:bg-indigo-900 p-6 rounded-lg shadow-lg flex items-center">
                    <FaDollarSign className="text-indigo-600 dark:text-indigo-400 mr-4" size={40} />
                    <div>
                        <h3 className="text-xl font-semibold text-indigo-800 dark:text-indigo-200">মোট প্রত্যাশিত বেতন</h3>
                        <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">${stats.totalExpectedSalary?.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* Navigation Cards */}
            <h3 className="text-2xl font-bold mb-4 text-center">দ্রুত অ্যাক্সেস</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Manage Users Card */}
                <Link to="/dashboard/manage-users" className="block p-6 bg-blue-100 dark:bg-blue-900 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 text-center transform hover:scale-105">
                    <FaUserShield className="text-blue-600 dark:text-blue-400 mx-auto mb-4" size={48} />
                    <h3 className="text-xl font-semibold mb-2 text-blue-800 dark:text-blue-200">ব্যবহারকারী পরিচালনা</h3>
                    <p className="text-gray-700 dark:text-gray-300">সিস্টেমের সকল ব্যবহারকারীর রোল এবং অ্যাকাউন্ট পরিচালনা করুন।</p>
                </Link>

                {/* All Employee List Card */}
                <Link to="/dashboard/all-employee-list" className="block p-6 bg-green-100 dark:bg-green-900 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 text-center transform hover:scale-105">
                    <FaUsers className="text-green-600 dark:text-green-400 mx-auto mb-4" size={48} />
                    <h3 className="text-xl font-semibold mb-2 text-green-800 dark:text-green-200">সকল কর্মচারী তালিকা</h3>
                    <p className="text-gray-700 dark:text-gray-300">সকল কর্মচারীর বিস্তারিত তালিকা এবং প্রোফাইল দেখুন।</p>
                </Link>

                {/* Payroll Management Card */}
                <Link to="/dashboard/payroll" className="block p-6 bg-purple-100 dark:bg-purple-900 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 text-center transform hover:scale-105">
                    <FaMoneyBillWave className="text-purple-600 dark:text-purple-400 mx-auto mb-4" size={48} />
                    <h3 className="text-xl font-semibold mb-2 text-purple-800 dark:text-purple-200">পে-রোল</h3>
                    <p className="text-gray-700 dark:text-gray-300">পেন্ডিং বেতন অনুরোধগুলি পর্যালোচনা এবং প্রক্রিয়া করুন।</p>
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

export default AdminDashboardHome;
