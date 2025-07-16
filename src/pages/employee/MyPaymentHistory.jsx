import  { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import LoadingSpinner from '../../utils/LoadingSpinner';
import ReusableTable from '../../utils/ReusableTable';
import ReusableCard from '../../components/cards/ReusableCard'; 
import Pagination from '../../utils/Pagination';
import { FaTable, FaThLarge } from 'react-icons/fa'; 

const MyPaymentHistory = () => {
    const { user, loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;
    const [viewMode, setViewMode] = useState('table'); 

    const toggleViewMode = useCallback(() => {
        setViewMode((prevMode) => (prevMode === 'table' ? 'card' : 'table'));
    }, []);

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

    // renderItem function for ReusableCard
    const renderPaymentCard = useCallback((paymentItem) => (
        <div className="flex flex-col space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {paymentItem.month} {paymentItem.year}
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Amount:</span> ${paymentItem.amount ? paymentItem.amount.toFixed(2) : '0.00'}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Transaction ID:</span> {paymentItem.transactionId || 'N/A'}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Payment Date:</span> {paymentItem.paymentDate ? new Date(paymentItem.paymentDate).toLocaleDateString() : 'N/A'}
            </p>
        </div>
    ), []);

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

            <div className="flex justify-end mb-4">
                <button
                    onClick={toggleViewMode}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 shadow-md"
                >
                    {viewMode === 'table' ? (
                        <>
                            <FaThLarge className="mr-2" /> Show Cards
                        </>
                    ) : (
                        <>
                            <FaTable className="mr-2" /> Show Table
                        </>
                    )}
                </button>
            </div>

            {sortedPayments.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400">No payment records found.</p>
            ) : (
                <>
                    {viewMode === 'table' ? (
                        <ReusableTable
                            columns={paymentHistoryColumns}
                            data={currentPayments}
                            rowKey="_id"
                            renderEmpty={<p className="text-center text-gray-600 dark:text-gray-400">No payment records found for this page.</p>}
                        />
                    ) : (
                        <ReusableCard
                            data={currentPayments}
                            rowKey="_id"
                            renderItem={renderPaymentCard}
                        />
                    )}

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