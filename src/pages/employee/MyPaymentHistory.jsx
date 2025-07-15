import React, { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import LoadingSpinner from '../../utils/LoadingSpinner';
import ReusableTable from '../../utils/ReusableTable';
import Pagination from '../../utils/Pagination';

const MyPaymentHistory = () => {
    const { user, loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { data: payments = [], isLoading, error } = useQuery({
        queryKey: ['my-payment-history', user?.uid],
        enabled: !!user?.uid && !authLoading,
        queryFn: async () => {
            const res = await axiosSecure.get(`/payments?uid=${user.uid}`);
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
                return a.year - b.year;
            }
           
            return monthOrder[a.month] - monthOrder[b.month];
        });
    }, [payments]); 

   
    const totalPages = Math.ceil(sortedPayments.length / itemsPerPage);

    
    const currentPayments = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedPayments.slice(startIndex, endIndex);
    }, [sortedPayments, currentPage, itemsPerPage]);

   
    const handlePageChange = useCallback((pageNumber) => {
        setCurrentPage(pageNumber);
    }, []);

    const paymentHistoryColumns = useMemo(() => [
        {
            header: 'Month',
            key: 'month',
            headerClassName: 'text-left',
            dataClassName: 'font-medium text-gray-900 dark:text-white',
        },
        {
            header: 'Year',
            key: 'year',
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
            header: 'Transaction ID',
            key: 'transactionId',
            headerClassName: 'text-left',
            dataClassName: 'text-gray-700 dark:text-gray-300',
            render: (payment) => payment.transactionId || 'N/A',
        },
        {
            header: 'Payment Date',
            key: 'paymentDate',
            headerClassName: 'text-left',
            dataClassName: 'text-gray-700 dark:text-gray-300',
            render: (payment) => payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A',
        },
    ], []);

    if (authLoading || isLoading) {
        return (
            <LoadingSpinner />
        );
    }

    if (error) {
        return (
            <div className="text-red-500 text-center py-10">
                <p>Failed to load payment history: {error.message}</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-900 dark:text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">My Payment History</h2>

            {sortedPayments.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400">No payment records found.</p>
            ) : (
                <>
                    <ReusableTable
                        columns={paymentHistoryColumns}
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

export default MyPaymentHistory;