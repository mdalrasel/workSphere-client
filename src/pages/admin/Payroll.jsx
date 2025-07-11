// src/pages/dashboard/Payroll.jsx
import React, { useState,  } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useUserRole from '../../hooks/useUserRole';
import { FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaRegTimesCircle } from 'react-icons/fa';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../main';
import CheckoutForm from '../../components/checkoutForm/CheckoutForm';

const Payroll = () => {
    const { user, loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const { role: loggedInUserRole, isLoading: roleLoading } = useUserRole();

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [clientSecretForModal, setClientSecretForModal] = useState(null);
    const [isClientSecretLoading, setIsClientSecretLoading] = useState(false);

    // 1. পেন্ডিং পেমেন্ট রিকোয়েস্ট লোড করুন
    const { data: pendingPaymentRequests = [], isLoading: requestsLoading, error: requestsError } = useQuery({
        queryKey: ['pendingPaymentRequests', loggedInUserRole],
        enabled: !!user?.email && !authLoading && !roleLoading && (loggedInUserRole === 'Admin' || loggedInUserRole === 'HR'),
        queryFn: async () => {
            const res = await axiosSecure.get('/payment-requests');
            return res.data;
        },
    });

    // 2. পেমেন্ট রিকোয়েস্ট 'approved' স্ট্যাটাসে আপডেট করার জন্য মিউটেশন
    const approvePaymentRequestMutation = useMutation({
        mutationFn: async ({ requestId, transactionId }) => {
            const res = await axiosSecure.patch(`/payment-requests/approve/${requestId}`, { transactionId });
            return res.data;
        },
        onSuccess: () => {
            Swal.fire({
                icon: "success",
                title: "Payment request approved and recorded successfully!",
                showConfirmButton: false,
                timer: 1500,
                background: '#fff',
                color: '#1f2937'
            });
            queryClient.invalidateQueries(['pendingPaymentRequests']);
            queryClient.invalidateQueries(['dashboard-stats']);
            queryClient.invalidateQueries(['all-payment-history']);
            queryClient.invalidateQueries(['my-payment-history', selectedRequest?.employeeEmail]);
            setIsPaymentModalOpen(false);
            setSelectedRequest(null);
            setClientSecretForModal(null);
        },
        onError: (error) => {
            console.error("Failed to approve payment request:", error);
            Swal.fire({
                icon: "error",
                title: "Payment Approval Failed",
                text: error.response?.data?.message || "Something went wrong.",
                confirmButtonColor: "#d33",
                background: '#fff',
                color: '#1f2937'
            });
        },
    });

    // 3. পেমেন্ট রিকোয়েস্ট 'rejected' স্ট্যাটাসে আপডেট করার জন্য মিউটেশন
    const rejectPaymentRequestMutation = useMutation({
        mutationFn: async (requestId) => {
            const res = await axiosSecure.patch(`/payment-requests/reject/${requestId}`);
            return res.data;
        },
        onSuccess: () => {
            Swal.fire({
                icon: "success",
                title: "Payment request rejected successfully!",
                showConfirmButton: false,
                timer: 1500,
                background: '#fff',
                color: '#1f2937'
            });
            queryClient.invalidateQueries(['pendingPaymentRequests']);
            queryClient.invalidateQueries(['dashboard-stats']);
        },
        onError: (error) => {
            console.error("Failed to reject payment request:", error);
            Swal.fire({
                icon: "error",
                title: "Payment Rejection Failed",
                text: error.response?.data?.message || "Something went wrong.",
                confirmButtonColor: "#d33",
                background: '#fff',
                color: '#1f2937'
            });
        },
    });

    // "Pay Salary" বাটনে ক্লিক করলে মডাল ওপেন করুন এবং clientSecret ফেচ করুন
    const handlePaySalary = async (request) => {
        setSelectedRequest(request);
        setIsPaymentModalOpen(true);
        setIsClientSecretLoading(true);

        try {
            const res = await axiosSecure.post('/create-payment-intent', {
                amount: request.amount,
                orderId: request._id,
                userId: request.employeeUid,
            });
            setClientSecretForModal(res.data.clientSecret);
            console.log("clientSecret fetched successfully:", res.data.clientSecret);
        } catch (error) {
            console.error("Error fetching client secret for modal:", error.response?.data || error.message);
            Swal.fire({
                icon: "error",
                title: "Payment Initialization Failed",
                text: error.response?.data?.error || "Could not prepare payment. Please try again.",
                background: '#fff',
                color: '#1f2937'
            });
            setIsPaymentModalOpen(false);
            setSelectedRequest(null);
        } finally {
            setIsClientSecretLoading(false);
        }
    };

    // পেমেন্ট মডাল বন্ধ করুন
    const handleClosePaymentModal = () => {
        setIsPaymentModalOpen(false);
        setSelectedRequest(null);
        setClientSecretForModal(null);
    };

    // "Reject" বাটনে ক্লিক করলে
    const handleRejectRequest = (request) => {
        Swal.fire({
            title: "Are you sure?",
            text: `Do you want to reject the salary request for ${request.employeeName} for ${request.month} ${request.year}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, reject it!",
            cancelButtonText: "No, cancel",
            background: '#fff',
            color: '#1f2937'
        }).then((result) => {
            if (result.isConfirmed) {
                rejectPaymentRequestMutation.mutate(request._id);
            }
        });
    };


    if (authLoading || roleLoading || requestsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
            </div>
        );
    }

    if (requestsError) {
        return (
            <div className="text-red-500 text-center py-10">
                <p>Failed to load pending payment requests: {requestsError.message}</p>
            </div>
        );
    }

    // শুধুমাত্র Admin বা HR রোল থাকলে এই পেজটি দেখান
    if (loggedInUserRole !== 'Admin' && loggedInUserRole !== 'HR') {
        return (
            <div className="text-red-500 text-center py-10">
                <h3 className="text-2xl font-bold">Access Denied</h3>
                <p className="mt-2">This page is only available for Admins and HRs.</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-900 dark:text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">Payroll Management</h2>
            <p className="text-lg text-center text-gray-700 dark:text-gray-300 mb-8">
                Manage and process pending salary payments for employees.
            </p>

            {pendingPaymentRequests.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400">No pending salary payments found.</p>
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
                                    Salary
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Payment Month
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Requested By
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {pendingPaymentRequests.map((request) => (
                                <tr key={request._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {request.employeeName || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {request.employeeEmail}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        ${request.amount?.toFixed(2) || '0.00'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {request.month} {request.year}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {request.requestedBy || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                            request.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                            request.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                        }`}>
                                            {request.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end space-x-2">
                                        {request.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handlePaySalary(request)}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center"
                                                    disabled={approvePaymentRequestMutation.isLoading || rejectPaymentRequestMutation.isLoading || isClientSecretLoading}
                                                >
                                                    <FaMoneyBillWave className="mr-2" /> Pay
                                                </button>
                                                <button
                                                    onClick={() => handleRejectRequest(request)}
                                                    className="bg-red-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-600 transition-colors shadow-md flex items-center justify-center"
                                                    disabled={approvePaymentRequestMutation.isLoading || rejectPaymentRequestMutation.isLoading || isClientSecretLoading}
                                                >
                                                    <FaRegTimesCircle className="mr-2" /> Reject
                                                </button>
                                            </>
                                        )}
                                        {request.status === 'approved' && (
                                            <span className="text-green-600 flex items-center justify-end">
                                                <FaCheckCircle className="mr-1" /> Approved
                                            </span>
                                        )}
                                        {request.status === 'rejected' && (
                                            <span className="text-red-600 flex items-center justify-end">
                                                <FaTimesCircle className="mr-1" /> Rejected
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Payment Modal */}
            {isPaymentModalOpen && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
                        <button
                            onClick={handleClosePaymentModal}
                            className="absolute top-3 right-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                            <FaTimesCircle size={24} />
                        </button>
                        <h3 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">
                            Pay Salary for {selectedRequest.employeeName}
                        </h3>
                        <p className="text-center text-gray-700 dark:text-gray-300 mb-6">
                            Amount: ${selectedRequest.amount?.toFixed(2)} for {selectedRequest.month} {selectedRequest.year}
                        </p>
                        {isClientSecretLoading ? (
                            <div className="flex items-center justify-center h-40">
                                <span className="loading loading-spinner loading-lg text-blue-600"></span>
                            </div>
                        ) : (
                            clientSecretForModal && (
                                <Elements stripe={stripePromise} options={{ clientSecret: clientSecretForModal }}>
                                    <CheckoutForm
                                        orderAmount={selectedRequest.amount}
                                        employeeName={selectedRequest.employeeName} // New prop
                                        employeeEmail={selectedRequest.employeeEmail} // New prop
                                        onPaymentSuccess={(transactionId) => {
                                            approvePaymentRequestMutation.mutate({
                                                requestId: selectedRequest._id,
                                                transactionId: transactionId
                                            });
                                        }}
                                        onPaymentError={(errorMessage) => {
                                            console.error("Payment failed:", errorMessage);
                                            Swal.fire({
                                                icon: "error",
                                                title: "Payment Failed",
                                                text: errorMessage,
                                                background: '#fff',
                                                color: '#1f2937'
                                            });
                                        }}
                                    />
                                </Elements>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payroll;
