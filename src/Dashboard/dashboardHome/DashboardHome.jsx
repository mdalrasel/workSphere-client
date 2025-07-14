import { Link } from 'react-router'; 
import {FaUsers, FaTasks, FaMoneyBillWave, FaDollarSign, FaHourglassHalf, FaUserTie, FaUserShield, FaUserFriends, FaChartPie, FaUserCog 
} from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useUserRole from '../../hooks/useUserRole';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '../../utils/LoadingSpinner';

const DashboardHome = () => {
    const { user, loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();
    const { role: loggedInUserRole, isLoading: roleLoading } = useUserRole();

    // Fetch dashboard statistics based on the logged-in user's role
    const { data: stats = {}, isLoading: statsLoading, error: statsError,} = useQuery({
        queryKey: ['dashboard-stats', loggedInUserRole, user?.email],
        enabled: !!user?.email && !authLoading && !roleLoading,
        queryFn: async () => {
            const res = await axiosSecure.get('/dashboard-stats');
            return res.data;
        },
    });

    // Fetch employee's payment history for the salary history chart (only for Employee role)
    const { data: employeePayments = [], isLoading: paymentsLoading, error: paymentsError, } = useQuery({
        queryKey: ['employee-payments-dashboard', user?.uid],
        enabled: !!user?.uid && !authLoading && !roleLoading && loggedInUserRole === 'Employee',
        queryFn: async () => {
            const res = await axiosSecure.get(`/payments?uid=${user.uid}`);
            return res.data;
        },
    });

    // Fetch employee's worksheet data for monthly work hours chart (only for Employee role)
    const { data: employeeWorksheets = [], isLoading: employeeWorksheetsLoading, error: employeeWorksheetsError, } = useQuery({
        queryKey: ['employee-worksheets-dashboard', user?.uid],
        enabled: !!user?.uid && !authLoading && !roleLoading && loggedInUserRole === 'Employee',
        queryFn: async () => {
            const res = await axiosSecure.get(`/worksheets?uid=${user.uid}`);
            return res.data;
        },
    });

    // Handle loading states for all queries
    if (authLoading || roleLoading || statsLoading || paymentsLoading || employeeWorksheetsLoading) {
        return (
            <LoadingSpinner />
        );
    }

    // Handle error states for all queries
    if (statsError || paymentsError || employeeWorksheetsError) {
        return (
            <div className="text-red-500 text-center py-10">
                <p>Failed to load dashboard data: {statsError?.message || paymentsError?.message || employeeWorksheetsError?.message}</p>
            </div>
        );
    }

    // Define month order for sorting charts
    const monthOrder = {
        "January": 0, "February": 1, "March": 2, "April": 3, "May": 4, "June": 5,
        "July": 6, "August": 7, "September": 8, "October": 9, "November": 10, "December": 11
    };

    // 1. Admin/HR User Distribution Pie Chart Data
    const userDistributionData = [
        { name: 'Employees', value: stats.totalEmployees || 0 },
        { name: 'HRs', value: stats.totalHRs || 0 },
        { name: 'Admins', value: stats.totalAdmins || 0 },
    ].filter(item => item.value > 0); // Filter out roles with zero users

    const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28']; // Colors for the pie chart

    // 2. Admin/HR Salary Overview Bar Chart Data
    const adminSalaryOverviewData = [
        { name: 'Total Paid Salary', value: stats.totalSalaryPaid || 0, color: '#4CAF50' }, // Green for paid
        { name: 'Total Expected Salary', value: stats.totalExpectedSalary || 0, color: '#FFC107' }, // Amber for expected
    ];

    // 3. Employee Salary History Bar Chart Data
    const employeeSalaryChartData = [...employeePayments].sort((a, b) => {
        if (a.year !== b.year) {
            return a.year - b.year;
        }
        return monthOrder[a.month] - monthOrder[b.month];
    }).map(p => ({
        name: `${p.month.substring(0, 3)} ${p.year % 100}`, // e.g., Jan 24
        Salary: p.amount,
    }));

    // 4. Employee Monthly Work Hours Bar Chart Data
    const employeeMonthlyHoursRaw = employeeWorksheets.reduce((acc, work) => {
        const key = `${work.month} ${work.year}`; // Use full month name and year for unique key
        if (!acc[key]) {
            acc[key] = { name: `${work.month.substring(0, 3)} ${work.year % 100}`, hours: 0, year: work.year, monthIndex: monthOrder[work.month] };
        }
        acc[key].hours += work.hours;
        return acc;
    }, {});

    const employeeMonthlyHoursChartData = Object.values(employeeMonthlyHoursRaw).sort((a, b) => {
        if (a.year !== b.year) {
            return a.year - b.year;
        }
        return a.monthIndex - b.monthIndex;
    });

    // --- Conditional Content Rendering ---

    let welcomeMessage = `Welcome, ${user?.displayName || 'User'}!`;
    let dashboardContent;
    let quickAccessCards;
    let chartsSection;

    if (loggedInUserRole === 'Admin' || loggedInUserRole === 'HR') {
        welcomeMessage = `Welcome, ${user?.displayName || loggedInUserRole}!`;
        dashboardContent = (
            <>
                <h3 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-white">Admin/HR Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
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
                    {loggedInUserRole === 'Admin' && (
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
            </>
        );

        quickAccessCards = (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loggedInUserRole === 'Admin' && (
                    <Link to="/dashboard/manage-users" className="block p-6 bg-blue-100 dark:bg-blue-900 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 text-center transform hover:scale-105">
                        <FaUserShield className="text-blue-600 dark:text-blue-400 mx-auto mb-4" size={48} />
                        <h3 className="text-xl font-semibold mb-2 text-blue-800 dark:text-blue-200">Manage Users</h3>
                        <p className="text-gray-700 dark:text-gray-300">Manage roles and accounts for all users in the system.</p>
                    </Link>
                )}
                <Link to="/dashboard/all-employee-list" className="block p-6 bg-green-100 dark:bg-green-900 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 text-center transform hover:scale-105">
                    <FaUsers className="text-green-600 dark:text-green-400 mx-auto mb-4" size={48} />
                    <h3 className="text-xl font-semibold mb-2 text-green-800 dark:text-green-200">All Employee List</h3>
                    <p className="text-gray-700 dark:text-gray-300">View detailed list and profiles of all employees.</p>
                </Link>
                <Link to="/dashboard/payroll" className="block p-6 bg-purple-100 dark:bg-purple-900 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 text-center transform hover:scale-105">
                    <FaMoneyBillWave className="text-purple-600 dark:text-purple-400 mx-auto mb-4" size={48} />
                    <h3 className="text-xl font-semibold mb-2 text-purple-800 dark:text-purple-200">Payroll</h3>
                    <p className="text-gray-700 dark:text-gray-300">Review and process pending salary requests.</p>
                </Link>
            </div>
        );

        chartsSection = (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <h3 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-white">User Distribution by Role</h3>
                    {userDistributionData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={userDistributionData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {userDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px', color: '#6b7280' }} className="dark:text-gray-300" />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center text-gray-600 dark:text-gray-400">No user distribution data available.</p>
                    )}
                </div>
                <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <h3 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-white">Total Salary Overview</h3>
                    {adminSalaryOverviewData.some(item => item.value > 0) ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={adminSalaryOverviewData}
                                margin={{
                                    top: 20, right: 30, left: 20, bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-gray-600" />
                                <XAxis dataKey="name" stroke="#6b7280" className="dark:stroke-gray-300" />
                                <YAxis stroke="#6b7280" className="dark:stroke-gray-300" label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft', fill: '#6b7280', className: 'dark:fill-gray-300' }} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px', color: '#6b7280' }} className="dark:text-gray-300" />
                                <Bar dataKey="value" fill="#3b82f6" radius={[10, 10, 0, 0]}>
                                    {adminSalaryOverviewData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center text-gray-600 dark:text-gray-400">No salary overview data available.</p>
                    )}
                </div>
            </div>
        );

    } else if (loggedInUserRole === 'Employee') {
        welcomeMessage = `Welcome, ${user?.displayName || 'Employee'}!`;
        dashboardContent = (
            <>
                <h3 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-white">My Statistics</h3>
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
            </>
        );

        quickAccessCards = (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link to="/dashboard/my-work-sheet" className="block p-6 bg-blue-100 dark:bg-blue-900 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 text-center transform hover:scale-105">
                    <FaTasks className="text-blue-600 dark:text-blue-400 mx-auto mb-4" size={48} />
                    <h3 className="text-xl font-semibold mb-2 text-blue-800 dark:text-blue-200">My Worksheets</h3>
                    <p className="text-gray-700 dark:text-gray-300">Submit and view your daily work details.</p>
                </Link>
                <Link to="/dashboard/my-payment-history" className="block p-6 bg-green-100 dark:bg-green-900 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 text-center transform hover:scale-105">
                    <FaMoneyBillWave className="text-green-600 dark:text-green-400 mx-auto mb-4" size={48} />
                    <h3 className="text-xl font-semibold mb-2 text-green-800 dark:text-green-200">My Payment History</h3>
                    <p className="text-gray-700 dark:text-gray-300">Review your paid salary history.</p>
                </Link>
            </div>
        );

        chartsSection = (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <h3 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-white">My Salary History</h3>
                    {employeeSalaryChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={employeeSalaryChartData}
                                margin={{
                                    top: 20, right: 30, left: 20, bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-gray-600" />
                                <XAxis dataKey="name" stroke="#6b7280" className="dark:stroke-gray-300" label={{ value: 'Month/Year', position: 'insideBottom', offset: 0, fill: '#6b7280', className: 'dark:fill-gray-300' }} />
                                <YAxis stroke="#6b7280" className="dark:stroke-gray-300" label={{ value: 'Salary ($)', angle: -90, position: 'insideLeft', fill: '#6b7280', className: 'dark:fill-gray-300' }} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px', color: '#6b7280' }} className="dark:text-gray-300" />
                                <Bar dataKey="Salary" fill="#3b82f6" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center text-gray-600 dark:text-gray-400">No salary history data available.</p>
                    )}
                </div>
                <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <h3 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-white">Monthly Work Hours</h3>
                    {employeeMonthlyHoursChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={employeeMonthlyHoursChartData}
                                margin={{
                                    top: 20, right: 30, left: 20, bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-gray-600" />
                                <XAxis dataKey="name" stroke="#6b7280" className="dark:stroke-gray-300" label={{ value: 'Month/Year', position: 'insideBottom', offset: 0, fill: '#6b7280', className: 'dark:fill-gray-300' }} />
                                <YAxis stroke="#6b7280" className="dark:stroke-gray-300" label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#6b7280', className: 'dark:fill-gray-300' }} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px', color: '#6b7280' }} className="dark:text-gray-300" />
                                <Bar dataKey="hours" fill="#8884d8" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center text-gray-600 dark:text-gray-400">No monthly work hours data available.</p>
                    )}
                </div>
            </div>
        );

    } else {
        // Default content for unrecognized roles or initial state
        dashboardContent = (
            <div className="text-center py-10 text-gray-700 dark:text-gray-300">
                <h3 className="text-2xl font-bold">Access Denied</h3>
                <p className="mt-2">Your role does not have access to specific dashboard features. Please contact support if you believe this is an error.</p>
            </div>
        );
        quickAccessCards = null;
        chartsSection = null;
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-900 dark:text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">
                {welcomeMessage}
            </h2>
            <p className="text-lg text-center text-gray-700 dark:text-gray-300 mb-8">
                Welcome to your WorkSphere Dashboard. Use the sidebar navigation to see more detailed information and functionalities according to your role.
            </p>

            {dashboardContent}

            {quickAccessCards && (
                <>
                    <h3 className="text-2xl font-bold mt-10 mb-4 text-center text-gray-800 dark:text-white">Quick Access</h3>
                    {quickAccessCards}
                </>
            )}

            {chartsSection}

            {/* Common Profile Link for all roles */}
            <h3 className="text-2xl font-bold mt-10 mb-4 text-center text-gray-800 dark:text-white">General Access</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link to="/dashboard/profile" className="block p-6 bg-yellow-100 dark:bg-yellow-900 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 text-center transform hover:scale-105">
                    <FaUserCog className="text-yellow-600 dark:text-yellow-400 mx-auto mb-4" size={48} />
                    <h3 className="text-xl font-semibold mb-2 text-yellow-800 dark:text-yellow-200">My Profile</h3>
                    <p className="text-gray-700 dark:text-gray-300">View and update your personal profile information.</p>
                </Link>
            </div>
        </div>
    );
};

export default DashboardHome;
