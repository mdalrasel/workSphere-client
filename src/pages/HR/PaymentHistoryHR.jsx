import React, { useMemo, useState, useCallback } from 'react'; 
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { useForm } from 'react-hook-form';
import LoadingSpinner from '../../utils/LoadingSpinner';
import ReusableTable from '../../utils/ReusableTable';
import Pagination from '../../utils/Pagination';

const PaymentHistoryHR = () => {
    const { loading: authLoading, user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const { register, watch } = useForm();

    // Watch form fields for filtering
    const employeeUidFilter = watch('employeeUid', '');
    const monthFilter = watch('month', '');
    const yearFilter = watch('year', '');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Items per page for the table

    // 1. Fetch all users (for employee name lookup)
    const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery({
        queryKey: ['all-users-for-payment-history-hr'],
        enabled: !authLoading, 
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
                return b.year - a.year; 
            }
            return monthOrder[b.month] - monthOrder[a.month]; 
        });
    }, [payments]);

    // Calculate total pages for the table
    const totalPages = Math.ceil(sortedPayments.length / itemsPerPage);

    // Get current items for the table
    const currentPayments = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedPayments.slice(startIndex, endIndex);
    }, [sortedPayments, currentPage, itemsPerPage]);

    // Handle page change for pagination
    const handlePageChange = useCallback((pageNumber) => {
        setCurrentPage(pageNumber);
    }, []);

    const months = [
        "", "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const currentYear = new Date().getFullYear();
    const years = ["", ...Array.from({ length: 5 }, (_, i) => currentYear - i)];

    // Define columns for ReusableTable
    const paymentHistoryHRColumns = useMemo(() => [
        {
            header: 'Employee Name',
            key: 'employeeUid',
            headerClassName: 'text-left',
            dataClassName: 'font-medium text-gray-900 dark:text-white',
            render: (payment) => employeeMap[payment.employeeUid] || payment.employeeName || 'N/A',
        },
        {
            header: 'Email',
            key: 'employeeEmail',
            headerClassName: 'text-left',
            dataClassName: 'text-gray-700 dark:text-gray-300',
        },
        {
            header: 'Amount',
            key: 'amount',
            headerClassName: 'text-left',
            dataClassName: 'text-gray-700 dark:text-gray-300',
            render: (payment) => `$${payment.amount ? payment.amount.toFixed(2) : '0.00'}`,
        },
        {
            header: 'Payment Month',
            key: 'month',
            headerClassName: 'text-left',
            dataClassName: 'text-gray-700 dark:text-gray-300',
            render: (payment) => `${payment.month} ${payment.year}`,
        },
        {
            header: 'Transaction ID',
            key: 'transactionId',
            headerClassName: 'text-left',
            dataClassName: 'text-gray-700 dark:text-gray-300',
        },
        {
            header: 'Payment Date',
            key: 'paymentDate',
            headerClassName: 'text-left',
            dataClassName: 'text-gray-700 dark:text-gray-300',
            render: (payment) => payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A',
        },
    ], [employeeMap]); 

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
                <>
                    <ReusableTable
                        columns={paymentHistoryHRColumns}
                        data={currentPayments} 
                        rowKey="_id"
                        renderEmpty={<p className="text-center text-gray-600 dark:text-gray-400">No payment records found for this page.</p>}
                    />
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        itemsPerPage={itemsPerPage}
                        totalItems={sortedPayments.length}
                    />
                </>
            )}
        </div>
    );
};

export default PaymentHistoryHR;