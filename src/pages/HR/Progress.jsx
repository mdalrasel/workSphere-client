// src/pages/dashboard/Progress.jsx

import { useQuery } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { useForm } from 'react-hook-form';

const Progress = () => {
    const { loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();
    const { register,  watch } = useForm();

    // Watch form fields for filtering
    const employeeUidFilter = watch('employeeUid', '');
    const monthFilter = watch('month', '');
    const yearFilter = watch('year', '');
    const taskFilter = watch('task', '');

    // 1. Fetch all users (for employee name lookup)
    const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery({
        queryKey: ['all-users-for-progress'],
        enabled: !authLoading,
        queryFn: async () => {
            const res = await axiosSecure.get('/users');
            return res.data;
        },
    });

    // Create a map for quick employee name lookup by UID
    const employeeMap = users.reduce((acc, user) => {
        if (user.uid) {
            acc[user.uid] = user.name;
        }
        return acc;
    }, {});

    // 2. Fetch all worksheets with filters
    const { data: worksheets = [], isLoading: worksheetsLoading, error: worksheetsError } = useQuery({
        queryKey: ['all-worksheets', employeeUidFilter, monthFilter, yearFilter, taskFilter],
        enabled: !authLoading,
        queryFn: async () => {
            const params = new URLSearchParams();
            if (employeeUidFilter) params.append('employeeUid', employeeUidFilter);
            if (monthFilter) params.append('month', monthFilter);
            if (yearFilter) params.append('year', yearFilter);
            if (taskFilter) params.append('task', taskFilter);

            const res = await axiosSecure.get(`/all-worksheets?${params.toString()}`);
            return res.data;
        },
    });

    // Prepare filter options
    const months = [
        "", "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const currentYear = new Date().getFullYear();
    const years = ["", ...Array.from({ length: 5 }, (_, i) => currentYear - i)]; // বর্তমান বছর থেকে ৫ বছর পিছন পর্যন্ত

    if (authLoading || usersLoading || worksheetsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
            </div>
        );
    }

    if (usersError || worksheetsError) {
        return (
            <div className="text-red-500 text-center py-10">
                <p>কাজের অগ্রগতি লোড করতে সমস্যা হয়েছে: {usersError?.message || worksheetsError?.message}</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-900 dark:text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">কর্মচারীদের কাজের অগ্রগতি</h2>

            {/* Filter Section */}
            <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div>
                    <label htmlFor="employeeUid" className="block text-sm font-medium mb-1">কর্মচারী</label>
                    <select
                        id="employeeUid"
                        {...register('employeeUid')}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">সকল কর্মচারী</option>
                        {users.filter(u => u.role === 'Employee' && u.uid).map(employee => (
                            <option key={employee.uid} value={employee.uid}>{employee.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="month" className="block text-sm font-medium mb-1">মাস</label>
                    <select
                        id="month"
                        {...register('month')}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    >
                        {months.map((month) => (
                            <option key={month} value={month}>{month === "" ? "সকল মাস" : month}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="year" className="block text-sm font-medium mb-1">বছর</label>
                    <select
                        id="year"
                        {...register('year')}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    >
                        {years.map((year) => (
                            <option key={year} value={year}>{year === "" ? "সকল বছর" : year}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="task" className="block text-sm font-medium mb-1">কাজ</label>
                    <input
                        type="text"
                        id="task"
                        {...register('task')}
                        placeholder="কাজের বিবরণ খুঁজুন"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </form>

            {worksheets.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400">কোনো কাজের অগ্রগতি পাওয়া যায়নি।</p>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    কর্মচারীর নাম
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    তারিখ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    মাস
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    বছর
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    কাজ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    ঘন্টা
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {worksheets.map((worksheet) => (
                                <tr key={worksheet._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {employeeMap[worksheet.uid] || 'অজানা কর্মচারী'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {worksheet.date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {worksheet.month}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {worksheet.year}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                        {worksheet.task}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {worksheet.hours}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Progress;
