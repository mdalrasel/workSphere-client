import { Link } from 'react-router'; // 'react-router' থেকে 'react-router-dom' এ পরিবর্তন করা হয়েছে
import { FaTasks, FaMoneyBillWave, FaUserCog, FaDollarSign, FaChartPie } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useUserRole from '../../hooks/useUserRole';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import LoadingSpinner from '../../utils/LoadingSpinner';

const EmployeeDashboardHome = () => {
    const { user, loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();
    const { role: loggedInUserRole, isLoading: roleLoading } = useUserRole();

    // Debugging logs
    useEffect(() => {
    }, [user, authLoading, roleLoading, loggedInUserRole]);

    const queryEnabled = !!user?.email && !authLoading && !roleLoading && loggedInUserRole === 'Employee';
    useEffect(() => {
    }, [queryEnabled]);


    // Fetch dashboard statistics for Employee
    const { data: stats = {}, isLoading: statsLoading, error: statsError } = useQuery({
        queryKey: ['dashboard-stats', loggedInUserRole, user?.email], 
        enabled: queryEnabled,
        staleTime: 0,
        queryFn: async () => {
            const url = `/dashboard-stats?email=${user.email}`;
            try {
                const res = await axiosSecure.get(url);
                return res.data;
            } catch (fetchError) {
                console.error("Error fetching Employee Dashboard Stats:", fetchError.response?.status, fetchError.response?.data, fetchError.message);
                throw fetchError;
            }
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

    if (loggedInUserRole !== 'Employee') {
        return (
            <div className="text-red-500 text-center py-10">
                <h3 className="text-2xl font-bold">Access Denied</h3>
                <p className="mt-2">This page is only available for Employees.</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-900 dark:text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">
                Welcome, {user?.displayName || 'Employee'}!
            </h2>
            <p className="text-lg text-center text-gray-700 dark:text-gray-300 mb-8">
                Welcome to your WorkSphere Employee Dashboard. From here, you can view your personal work and salary information.
            </p>

            {/* Employee Specific Statistics */}
            <h3 className="text-2xl font-bold mb-4 text-center">My Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <div className="bg-blue-100 dark:bg-blue-900 p-6 rounded-lg shadow-lg flex items-center">
                    <FaTasks className="text-blue-600 dark:text-blue-400 mr-4" size={40} />
                    <div>
                        <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200">My Total Worksheets</h3>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.myTotalWorksheets}</p>
                    </div>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-6 rounded-lg shadow-lg flex items-center">
                    <FaMoneyBillWave className="text-green-600 dark:text-green-400 mr-4" size={40} />
                    <div>
                        <h3 className="text-xl font-semibold text-green-800 dark:text-green-200">My Total Salary Paid</h3>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">${stats.myTotalSalaryPaid?.toFixed(2)}</p>
                    </div>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 p-6 rounded-lg shadow-lg flex items-center">
                    <FaDollarSign className="text-purple-600 dark:text-purple-400 mr-4" size={40} />
                    <div>
                        <h3 className="text-xl font-semibold text-purple-800 dark:text-purple-200">My Expected Salary</h3>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">${stats.myExpectedSalary?.toFixed(2)}</p>
                    </div>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900 p-6 rounded-lg shadow-lg flex items-center">
                    <FaChartPie className="text-yellow-600 dark:text-yellow-400 mr-4" size={40} />
                    <div>
                        <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200">My Total Payments</h3>
                        <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.myTotalPayments}</p>
                    </div>
                </div>
            </div>

            {/* Navigation Cards */}
            <h3 className="text-2xl font-bold mb-4 text-center">Quick Access</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* My WorkSheet Card */}
                <Link to="/dashboard/my-work-sheet" className="block p-6 bg-blue-100 dark:bg-blue-900 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 text-center transform hover:scale-105">
                    <FaTasks className="text-blue-600 dark:text-blue-400 mx-auto mb-4" size={48} />
                    <h3 className="text-xl font-semibold mb-2 text-blue-800 dark:text-blue-200">My Worksheets</h3>
                    <p className="text-gray-700 dark:text-gray-300">Submit and view your daily work details.</p>
                </Link>

                {/* My Payment History Card */}
                <Link to="/dashboard/my-payment-history" className="block p-6 bg-green-100 dark:bg-green-900 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 text-center transform hover:scale-105">
                    <FaMoneyBillWave className="text-green-600 dark:text-green-400 mx-auto mb-4" size={48} />
                    <h3 className="text-xl font-semibold mb-2 text-green-800 dark:text-green-200">My Payment History</h3>
                    <p className="text-gray-700 dark:text-gray-300">Review your paid salary history.</p>
                </Link>

                {/* Your Profile Card */}
                <Link to="/dashboard/profile" className="block p-6 bg-yellow-100 dark:bg-yellow-900 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 text-center transform hover:scale-105">
                    <FaUserCog className="text-yellow-600 dark:text-yellow-400 mx-auto mb-4" size={48} />
                    <h3 className="text-xl font-semibold mb-2 text-yellow-800 dark:text-yellow-200">My Profile</h3>
                    <p className="text-gray-700 dark:text-gray-300">View and update your personal profile information.</p>
                </Link>
            </div>
        </div>
    );
};

export default EmployeeDashboardHome;
