// src/pages/dashboard/PaymentHistoryHR.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { useForm } from 'react-hook-form';

const PaymentHistoryHR = () => {
    const { loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();
    const { register, watch } = useForm();

    // Watch form fields for filtering
    const employeeUidFilter = watch('employeeUid', '');
    const monthFilter = watch('month', '');
    const yearFilter = watch('year', '');

    // 1. Fetch all users (for employee name lookup)
    const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery({
        queryKey: ['all-users-for-payment-history'],
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

    // 2. Fetch all payments with filters
    const { data: payments = [], isLoading: paymentsLoading, error: paymentsError } = useQuery({
        queryKey: ['all-payments', employeeUidFilter, monthFilter, yearFilter],
        enabled: !authLoading,
        queryFn: async () => {
            const params = new URLSearchParams();
            if (employeeUidFilter) params.append('employeeUid', employeeUidFilter);
            if (monthFilter) params.append('month', monthFilter);
            if (yearFilter) params.append('year', yearFilter);

            const res = await axiosSecure.get(`/all-payments?${params.toString()}`);
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

    if (authLoading || usersLoading || paymentsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
            </div>
        );
    }

    if (usersError || paymentsError) {
        return (
            <div className="text-red-500 text-center py-10">
                <p>পেমেন্ট ইতিহাস লোড করতে সমস্যা হয়েছে: {usersError?.message || paymentsError?.message}</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-900 dark:text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">সকল কর্মচারীর পেমেন্ট ইতিহাস</h2>

            {/* Filter Section */}
            <form className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
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
            </form>

            {payments.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400">কোনো পেমেন্ট ইতিহাস পাওয়া যায়নি।</p>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    কর্মচারীর নাম
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    মাস
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    বছর
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    বেতন
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    লেনদেন আইডি
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {payments.map((payment) => (
                                <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {employeeMap[payment.uid] || 'অজানা কর্মচারী'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {payment.month}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {payment.year}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        ${payment.amount ? payment.amount.toFixed(2) : '0.00'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {payment.transactionId || 'N/A'}
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

export default PaymentHistoryHR;
