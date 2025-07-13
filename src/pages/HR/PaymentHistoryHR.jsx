// src/pages/HR/PaymentHistoryHR.jsx
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { useForm } from 'react-hook-form';
import LoadingSpinner from '../../utils/LoadingSpinner';

const PaymentHistoryHR = () => {
    const { loading: authLoading, user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const { register, watch } = useForm();

    // Watch form fields for filtering
    const employeeUidFilter = watch('employeeUid', '');
    const monthFilter = watch('month', '');
    const yearFilter = watch('year', '');

    // 1. Fetch all users (for employee name lookup)
    const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery({
        queryKey: ['all-users-for-payment-history-hr'],
        enabled: !authLoading, // Ensure query is enabled only when auth is not loading
        queryFn: async () => {
            const res = await axiosSecure.get('/users');
            return res.data;
        },
    });

    // Create a map for quick employee name lookup by UID
    const employeeMap = useMemo(() => {
        return users.reduce((acc, user) => {
            if (user.uid) {
                acc[user.uid] = user.name;
            }
            return acc;
        }, {});
    }, [users]);

    // 2. Fetch all payments with filters
    const { data: payments = [], isLoading: paymentsLoading, error: paymentsError } = useQuery({
        queryKey: ['all-payment-history', employeeUidFilter, monthFilter, yearFilter],
        enabled: !!user?.email && !authLoading, 
        queryFn: async () => {
            const params = new URLSearchParams();
            if (employeeUidFilter) params.append('employeeUid', employeeUidFilter);
            if (monthFilter) params.append('month', monthFilter);
            if (yearFilter) params.append('year', yearFilter);

            const res = await axiosSecure.get(`/all-payments?${params.toString()}`);
            return res.data;
        },
    });

    const sortedPayments = useMemo(() => {
        const monthOrder = {
            "January": 0, "February": 1, "March": 2, "April": 3, "May": 4, "June": 5,
            "July": 6, "August": 7, "September": 8, "October": 9, "November": 10, "December": 11
        };

        return [...payments].sort((a, b) => {
            if (a.year !== b.year) {
                return b.year - a.year; // Latest year first
            }
            return monthOrder[b.month] - monthOrder[a.month]; // Latest month first
        });
    }, [payments]);

    const months = [
        "", "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const currentYear = new Date().getFullYear();
    const years = ["", ...Array.from({ length: 5 }, (_, i) => currentYear - i)];

    if (authLoading || usersLoading || paymentsLoading || !user) {
        return (
            <LoadingSpinner />
        );
    }

    if (usersError || paymentsError) {
        return (
            <div className="text-red-500 text-center py-10">
                <p>Failed to load payment history: {usersError?.message || paymentsError?.message}</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-900 dark:text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">Payment History (HR View)</h2>

            {/* Filter Section */}
            <form className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div>
                    <label htmlFor="employeeUid" className="block text-sm font-medium mb-1">Employee</label>
                    <select
                        id="employeeUid"
                        {...register('employeeUid')}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">All Employees</option>
                        {users.filter(u => u.role === 'Employee' && u.uid).map(employee => (
                            <option key={employee.uid} value={employee.uid}>{employee.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="month" className="block text-sm font-medium mb-1">Month</label>
                    <select
                        id="month"
                        {...register('month')}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    >
                        {months.map((month) => (
                            <option key={month} value={month}>{month === "" ? "All Months" : month}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="year" className="block text-sm font-medium mb-1">Year</label>
                    <select
                        id="year"
                        {...register('year')}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    >
                        {years.map((year) => (
                            <option key={year} value={year}>{year === "" ? "All Years" : year}</option>
                        ))}
                    </select>
                </div>
            </form>

            {sortedPayments.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400">No payment records found for the selected filters.</p>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Employee Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Payment Month
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Transaction ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Payment Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {sortedPayments.map((payment) => (
                                <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {employeeMap[payment.employeeUid] || payment.employeeName || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {payment.employeeEmail || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        ${payment.amount ? payment.amount.toFixed(2) : '0.00'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {payment.month} {payment.year}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {payment.transactionId || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}
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
