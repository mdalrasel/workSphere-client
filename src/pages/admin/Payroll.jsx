// src/pages/dashboard/Payroll.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useUserRole from '../../hooks/useUserRole'; // অ্যাডমিনের রোল চেক করার জন্য
import { FaCheckCircle, FaTimesCircle, FaDollarSign } from 'react-icons/fa';

const Payroll = () => {
    const {  loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const { role: loggedInUserRole, isLoading: roleLoading } = useUserRole(); // লগইন করা ইউজারের রোল

    const [isTransactionIdModalOpen, setIsTransactionIdModalOpen] = useState(false);
    const [currentRequestId, setCurrentRequestId] = useState(null);

    // 1. Fetch all pending payment requests
    const { data: requests = [], isLoading: requestsLoading, error: requestsError } = useQuery({
        queryKey: ['pendingPaymentRequests'],
        enabled: !authLoading && !roleLoading && loggedInUserRole === 'Admin', // অ্যাডমিন হলে তবেই ফেচ করবে
        queryFn: async () => {
            const res = await axiosSecure.get('/payment-requests'); // এই API শুধু পেন্ডিং রিকোয়েস্ট দেয়
            return res.data;
        },
    });

    // 2. Mutation for approving a payment request
    const approveRequestMutation = useMutation({
        mutationFn: async ({ id, transactionId }) => {
            const res = await axiosSecure.patch(`/payment-requests/approve/${id}`, { transactionId });
            return res.data;
        },
        onSuccess: () => {
            Swal.fire({
                icon: "success",
                title: "পেমেন্ট সফলভাবে অ্যাপ্রুভ করা হয়েছে!",
                showConfirmButton: false,
                timer: 1500,
                background: '#fff',
                color: '#1f2937'
            });
            queryClient.invalidateQueries(['pendingPaymentRequests']); // পেন্ডিং রিকোয়েস্ট রি-ফেচ করুন
            queryClient.invalidateQueries(['all-payments']); // সকল পেমেন্ট ইতিহাস আপডেট করুন
            queryClient.invalidateQueries(['dashboard-stats']); // ড্যাশবোর্ড স্ট্যাটস আপডেট হতে পারে
            closeTransactionIdModal();
        },
        onError: (error) => {
            console.error("পেমেন্ট অ্যাপ্রুভ করতে ব্যর্থ:", error);
            Swal.fire({
                icon: "error",
                title: "অ্যাপ্রুভ ব্যর্থ",
                text: error.response?.data?.message || "কিছু ভুল হয়েছে।",
                confirmButtonColor: "#d33",
                background: '#fff',
                color: '#1f2937'
            });
            closeTransactionIdModal();
        },
    });

    // 3. Mutation for rejecting a payment request
    const rejectRequestMutation = useMutation({
        mutationFn: async (id) => {
            const res = await axiosSecure.patch(`/payment-requests/reject/${id}`);
            return res.data;
        },
        onSuccess: () => {
            Swal.fire({
                icon: "success",
                title: "পেমেন্ট রিকোয়েস্ট সফলভাবে রিজেক্ট করা হয়েছে!",
                showConfirmButton: false,
                timer: 1500,
                background: '#fff',
                color: '#1f2937'
            });
            queryClient.invalidateQueries(['pendingPaymentRequests']); // পেন্ডিং রিকোয়েস্ট রি-ফেচ করুন
            queryClient.invalidateQueries(['dashboard-stats']); // ড্যাশবোর্ড স্ট্যাটস আপডেট হতে পারে
        },
        onError: (error) => {
            console.error("পেমেন্ট রিকোয়েস্ট রিজেক্ট করতে ব্যর্থ:", error);
            Swal.fire({
                icon: "error",
                title: "রিজেক্ট ব্যর্থ",
                text: error.response?.data?.message || "কিছু ভুল হয়েছে।",
                confirmButtonColor: "#d33",
                background: '#fff',
                color: '#1f2937'
            });
        },
    });

    // Handle Approve button click (opens modal for transaction ID)
    const handleApproveClick = (requestId) => {
        setCurrentRequestId(requestId);
        setIsTransactionIdModalOpen(true);
    };

    // Handle actual approval with transaction ID
    const handleApproveConfirm = () => {
        const transactionId = document.getElementById('transactionIdInput').value;
        if (!transactionId) {
            Swal.fire({
                icon: "warning",
                title: "লেনদেন আইডি আবশ্যক",
                text: "পেমেন্ট অ্যাপ্রুভ করার জন্য লেনদেন আইডি প্রদান করুন।",
                confirmButtonColor: "#3085d6",
                background: '#fff',
                color: '#1f2937'
            });
            return;
        }
        approveRequestMutation.mutate({ id: currentRequestId, transactionId });
    };

    // Handle Reject button click
    const handleReject = (requestId, employeeName) => {
        Swal.fire({
            title: "আপনি কি নিশ্চিত?",
            text: `আপনি কি ${employeeName} এর পেমেন্ট রিকোয়েস্টটি রিজেক্ট করতে চান?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "হ্যাঁ, রিজেক্ট করুন!",
            cancelButtonText: "না, বাতিল করুন",
            background: '#fff',
            color: '#1f2937'
        }).then((result) => {
            if (result.isConfirmed) {
                rejectRequestMutation.mutate(requestId);
            }
        });
    };

    const closeTransactionIdModal = () => {
        setIsTransactionIdModalOpen(false);
        setCurrentRequestId(null);
    };

    if (authLoading || requestsLoading || roleLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
            </div>
        );
    }

    if (requestsError) {
        return (
            <div className="text-red-500 text-center py-10">
                <p>পেমেন্ট রিকোয়েস্ট লোড করতে সমস্যা হয়েছে: {requestsError.message}</p>
            </div>
        );
    }

    // যদি লগইন করা ইউজার অ্যাডমিন না হয়, তাহলে Forbidden মেসেজ দেখান
    if (loggedInUserRole !== 'Admin') {
        return (
            <div className="text-red-500 text-center py-10">
                <h3 className="text-2xl font-bold">প্রবেশাধিকার নেই</h3>
                <p className="mt-2">এই পৃষ্ঠাটি শুধুমাত্র অ্যাডমিনদের জন্য উপলব্ধ।</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-900 dark:text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">পেন্ডিং পে-রোল রিকোয়েস্ট</h2>

            {requests.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400">কোনো পেন্ডিং পেমেন্ট রিকোয়েস্ট পাওয়া যায়নি।</p>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    কর্মচারীর নাম
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    ইমেইল
                                </th>
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
                                    অনুরোধের তারিখ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    অ্যাকশন
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {requests.map((request) => (
                                <tr key={request._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {request.employeeName || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {request.employeeEmail}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {request.month}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {request.year}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        ${request.amount ? request.amount.toFixed(2) : '0.00'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {new Date(request.requestDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {/* Approve Button */}
                                        <button
                                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200 mr-2 p-2 rounded-md transition-colors duration-200"
                                            title="অ্যাপ্রুভ করুন"
                                            onClick={() => handleApproveClick(request._id)}
                                            disabled={approveRequestMutation.isLoading || rejectRequestMutation.isLoading}
                                        >
                                            <FaCheckCircle size={20} />
                                        </button>
                                        {/* Reject Button */}
                                        <button
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-2 rounded-md transition-colors duration-200"
                                            title="রিজেক্ট করুন"
                                            onClick={() => handleReject(request._id, request.employeeName)}
                                            disabled={approveRequestMutation.isLoading || rejectRequestMutation.isLoading}
                                        >
                                            <FaTimesCircle size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Transaction ID Input Modal */}
            {isTransactionIdModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm relative">
                        <h3 className="text-2xl font-semibold mb-6 text-center text-gray-900 dark:text-white">লেনদেন আইডি দিন</h3>
                        <button
                            onClick={closeTransactionIdModal}
                            className="absolute top-4 right-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl"
                        >
                            &times;
                        </button>
                        <div className="mb-4">
                            <label htmlFor="transactionIdInput" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">লেনদেন আইডি</label>
                            <input
                                type="text"
                                id="transactionIdInput"
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                placeholder="লেনদেন আইডি লিখুন"
                            />
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={closeTransactionIdModal}
                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-400 transition-colors shadow-md"
                            >
                                বাতিল করুন
                            </button>
                            <button
                                type="button"
                                onClick={handleApproveConfirm}
                                className="bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-700 transition-colors shadow-md"
                                disabled={approveRequestMutation.isLoading}
                            >
                                {approveRequestMutation.isLoading ? 'অ্যাপ্রুভ হচ্ছে...' : 'অ্যাপ্রুভ করুন'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payroll;
