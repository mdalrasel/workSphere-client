import { useParams } from 'react-router'; 
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'; 

const EmployeeDetails = () => {
    const { slug } = useParams(); 
    const { loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();

    // 1. Fetch employee's profile data
    const { data: employeeData = {}, isLoading: employeeLoading, error: employeeError, } = useQuery({
        queryKey: ['employee-details', slug],
        enabled: !!slug && !authLoading,
        queryFn: async () => {
            const res = await axiosSecure.get(`/users?uid=${slug}`); // Fetch user data by UID
            return res.data;
        },
    });

    // 2. Fetch employee's payment history for the chart
    const { data: payments = [], isLoading: paymentsLoading, error: paymentsError } = useQuery({
        queryKey: ['employee-payments', slug],
        enabled: !!slug && !authLoading,
        queryFn: async () => {
            const res = await axiosSecure.get(`/payments?uid=${slug}`); // Fetch payment data by UID
            return res.data;
        },
    });

    const chartData = [...payments].sort((a, b) => {
        const monthOrder = {
            "January": 0, "February": 1, "March": 2, "April": 3, "May": 4, "June": 5,
            "July": 6, "August": 7, "September": 8, "October": 9, "November": 10, "December": 11
        };
        if (a.year !== b.year) {
            return a.year - b.year;
        }
        return monthOrder[a.month] - monthOrder[b.month];
    }).map(p => ({
        name: `${p.month.substring(0, 3)} ${p.year % 100}`, 
        Salary: p.amount, 
    }));


    if (authLoading || employeeLoading || paymentsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
            </div>
        );
    }

    if (employeeError || paymentsError) {
        return (
            <div className="text-red-500 text-center py-10">
                <p>Failed to load employee details: {employeeError?.message || paymentsError?.message}</p>
            </div>
        );
    }

    if (!employeeData._id) { 
        return (
            <div className="text-center py-10 text-gray-700 dark:text-gray-300">
                <h3 className="text-2xl font-bold">Employee not found.</h3>
                <p className="mt-2">Please try with a valid employee ID.</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-900 dark:text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">Employee Details</h2>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                <img
                    src={employeeData.photoURL || "https://i.ibb.co/2kRZ3mZ/default-user.png"}
                    alt="Employee Photo"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-600 dark:border-blue-400 shadow-lg flex-shrink-0"
                />
                <div className="text-center md:text-left">
                    <h3 className="text-2xl font-semibold mb-2">{employeeData.name || 'N/A'}</h3>
                    <p className="text-gray-700 dark:text-gray-300"><strong>Email:</strong> {employeeData.email || 'N/A'}</p>
                    <p className="text-gray-700 dark:text-gray-300"><strong>Designation:</strong> {employeeData.designation || 'N/A'}</p>
                    <p className="text-gray-700 dark:text-gray-300"><strong>Salary:</strong> ${employeeData.salary ? employeeData.salary.toFixed(2) : '0.00'}</p>
                    <p className="text-gray-700 dark:text-gray-300"><strong>Bank Account:</strong> {employeeData.bank_account_no || 'N/A'}</p>
                    <p className="text-gray-700 dark:text-gray-300"><strong>Verified:</strong> {employeeData.isVerified ? 'Yes ✅' : 'No ❌'}</p>
                </div>
            </div>

            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                <h3 className="text-2xl font-semibold mb-4 text-center">Salary vs. Month/Year</h3>
                {chartData.length === 0 ? (
                    <p className="text-center text-gray-600 dark:text-gray-400">No payment data found for this employee.</p>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={chartData}
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
                )}
            </div>
        </div>
    );
};

export default EmployeeDetails;
