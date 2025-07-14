import { useQuery } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useUserRole from '../../hooks/useUserRole'; 
import { FaUsers, FaTasks, FaMoneyBillWave, FaDollarSign, FaHourglassHalf, FaUserTie, FaUserShield, FaUserFriends, FaChartPie } from 'react-icons/fa';
import LoadingSpinner from '../../utils/LoadingSpinner';

const HRDashboardHome = () => {
    const { user, loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();
    const { role, isLoading: roleLoading } = useUserRole(); 

    const { data: stats = {}, isLoading: statsLoading, error: statsError,} = useQuery({
        queryKey: ['dashboard-stats', role], 
        enabled: !!user?.email && !authLoading && !roleLoading, // Ensure query is enabled only when user and role are loaded
        queryFn: async () => {
            const res = await axiosSecure.get('/dashboard-stats');
            return res.data;
        },
    });

    if (authLoading || roleLoading || statsLoading) {
        return (
            <LoadingSpinner />
        );
    }

    if (statsError) {
        return (
            <div className="text-red-500 text-center py-10">
                <p>Failed to load dashboard statistics: {statsError.message}</p>
            </div>
        );
    }

    // Ensure only HR or Admin can see this page
    if (role !== 'Admin' && role !== 'HR') {
        return (
            <div className="text-red-500 text-center py-10">
                <h3 className="text-2xl font-bold">Access Denied</h3>
                <p className="mt-2">This page is only available for Admins and HRs.</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-900 dark:text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">
                Welcome, {user?.displayName || 'HR'}!
            </h2>
            <p className="text-lg text-center text-gray-700 dark:text-gray-300 mb-8">
                Welcome to your WorkSphere HR Dashboard. Here are some important statistics for you.
            </p>

            {/* Admin/HR Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-100 dark:bg-blue-900 p-6 rounded-lg shadow-lg flex items-center">
                    <FaUsers className="text-blue-600 dark:text-blue-400 mr-4" size={40} />
                    <div>
                        <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200">Total Users</h3>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalUsers}</p>
                    </div>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-6 rounded-lg shadow-lg flex items-center">
                    <FaUserTie className="text-green-600 dark:text-green-400 mr-4" size={40} />
                    <div>
                        <h3 className="text-xl font-semibold text-green-800 dark:text-green-200">Total Employees</h3>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.totalEmployees}</p>
                    </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 p-6 rounded-lg shadow-lg flex items-center">
                    <FaUserFriends className="text-purple-600 dark:text-purple-400 mr-4" size={40} />
                    <div>
                        <h3 className="text-xl font-semibold text-purple-800 dark:text-purple-200">Total HRs</h3>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.totalHRs}</p>
                    </div>
                </div>
                {role === 'Admin' && ( // Only for Admin
                    <div className="bg-red-100 dark:bg-red-900 p-6 rounded-lg shadow-lg flex items-center">
                        <FaUserShield className="text-red-600 dark:text-red-400 mr-4" size={40} />
                        <div>
                            <h3 className="text-xl font-semibold text-red-800 dark:text-red-200">Total Admins</h3>
                            <p className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.totalAdmins}</p>
                        </div>
                    </div>
                )}
                <div className="bg-yellow-100 dark:bg-yellow-900 p-6 rounded-lg shadow-lg flex items-center">
                    <FaTasks className="text-yellow-600 dark:text-yellow-400 mr-4" size={40} />
                    <div>
                        <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200">Total Worksheets</h3>
                        <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.totalWorksheets}</p>
                    </div>
                </div>
                <div className="bg-teal-100 dark:bg-teal-900 p-6 rounded-lg shadow-lg flex items-center">
                    <FaMoneyBillWave className="text-teal-600 dark:text-teal-400 mr-4" size={40} />
                    <div>
                        <h3 className="text-xl font-semibold text-teal-800 dark:text-teal-200">Total Salary Paid</h3>
                        <p className="text-2xl font-bold text-teal-900 dark:text-teal-100">${stats.totalSalaryPaid?.toFixed(2)}</p>
                    </div>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900 p-6 rounded-lg shadow-lg flex items-center">
                    <FaHourglassHalf className="text-orange-600 dark:text-orange-400 mr-4" size={40} />
                    <div>
                        <h3 className="text-xl font-semibold text-orange-800 dark:text-orange-200">Pending Payment Requests</h3>
                        <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.totalPendingPaymentRequests}</p>
                    </div>
                </div>
                <div className="bg-indigo-100 dark:bg-indigo-900 p-6 rounded-lg shadow-lg flex items-center">
                    <FaDollarSign className="text-indigo-600 dark:text-indigo-400 mr-4" size={40} />
                    <div>
                        <h3 className="text-xl font-semibold text-indigo-800 dark:text-indigo-200">Total Expected Salary</h3>
                        <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">${stats.totalExpectedSalary?.toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HRDashboardHome;
