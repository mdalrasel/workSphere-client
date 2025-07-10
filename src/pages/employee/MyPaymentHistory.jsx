// src/pages/dashboard/MyPaymentHistory.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';

const MyPaymentHistory = () => {
    const { user, loading } = useAuth();
    const axiosSecure = useAxiosSecure();

    // 1. Fetch payment history for the current user
    const { data: payments = [], isLoading, error } = useQuery({
        queryKey: ['my-payment-history', user?.uid],
        enabled: !!user?.uid && !loading,
        queryFn: async () => {
            const res = await axiosSecure.get(`/payments?uid=${user.uid}`);
            return res.data;
        },
    });

    // ডেটা সর্টিং লজিক
    const sortedPayments = [...payments].sort((a, b) => {
        // মাসের নামকে সংখ্যায় রূপান্তর করার জন্য একটি ম্যাপ
        const monthOrder = {
            "January": 0, "February": 1, "March": 2, "April": 3, "May": 4, "June": 5,
            "July": 6, "August": 7, "September": 8, "October": 9, "November": 10, "December": 11
        };

        // প্রথমে বছর অনুযায়ী সর্ট করুন (পুরনো বছর আগে)
        if (a.year !== b.year) {
            return a.year - b.year;
        }
        // যদি বছর একই হয়, তাহলে মাস অনুযায়ী সর্ট করুন (পুরনো মাস আগে)
        return monthOrder[a.month] - monthOrder[b.month];
    });

    if (loading || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 text-center py-10">
                <p>পেমেন্ট ইতিহাস লোড করতে সমস্যা হয়েছে: {error.message}</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-900 dark:text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">আমার পেমেন্ট ইতিহাস</h2>

            {sortedPayments.length === 0 ? ( // sortedPayments ব্যবহার করা হয়েছে
                <p className="text-center text-gray-600 dark:text-gray-400">কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি।</p>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    মাস
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    বছর
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    পরিমাণ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    ট্রানজেকশন আইডি
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {sortedPayments.map((payment) => ( // sortedPayments ব্যবহার করা হয়েছে
                                <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
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

export default MyPaymentHistory;
