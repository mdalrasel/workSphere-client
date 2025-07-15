import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaRegTimesCircle, FaTable, FaThLarge } from 'react-icons/fa';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../main';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useUserRole from '../../hooks/useUserRole';
import LoadingSpinner from '../../utils/LoadingSpinner';
import ReusableTable from '../../utils/ReusableTable';
import Pagination from '../../utils/Pagination';
import CheckoutForm from '../../components/checkoutForm/CheckoutForm'
import ReusableCard from '../../components/cards/ReusableCard';

const Payroll = () => {
    const { user, loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const { role: loggedInUserRole, isLoading: roleLoading } = useUserRole();

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [clientSecretForModal, setClientSecretForModal] = useState(null);
    const [isClientSecretLoading, setIsClientSecretLoading] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    // New state: to track the current view mode (default 'table')
    const [viewMode, setViewMode] = useState('table'); 

    // Function to toggle the view mode
    const toggleViewMode = useCallback(() => {
        setViewMode((prevMode) => (prevMode === 'table' ? 'card' : 'table'));
    }, []);

    const { data: pendingPaymentRequests = [], isLoading: requestsLoading, error: requestsError } = useQuery({
        queryKey: ['pendingPaymentRequests', loggedInUserRole],
        enabled: !!user?.email && !!user?.uid && !authLoading && !roleLoading && (loggedInUserRole === 'Admin' || loggedInUserRole === 'HR'),
        queryFn: async () => {
            const res = await axiosSecure.get('/payment-requests');
            return res.data;
        },
    });

    const allRequests = useMemo(() => pendingPaymentRequests, [pendingPaymentRequests]);

    // Calculate total pages
    const totalPages = Math.ceil(allRequests.length / itemsPerPage);

    // Get current items for the table
    const currentRequests = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return allRequests.slice(startIndex, endIndex);
    }, [allRequests, currentPage, itemsPerPage]);

    // Handle page change
    const handlePageChange = useCallback((pageNumber) => {
        setCurrentPage(pageNumber);
    }, []);


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
            queryClient.invalidateQueries(['my-payment-history', selectedRequest?.employeeUid]); 
            queryClient.invalidateQueries(['dashboard-stats-employee', loggedInUserRole, selectedRequest?.employeeEmail]); 
            setIsPaymentModalOpen(false);
            setSelectedRequest(null);
            setClientSecretForModal(null);
        },
        onError: (error) => {
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

    // Wrap handlePaySalary in useCallback
    const handlePaySalary = useCallback(async (request) => {
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
        } catch (error) {
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
    }, [axiosSecure]); 

    const handleClosePaymentModal = useCallback(() => {
        setIsPaymentModalOpen(false);
        setSelectedRequest(null);
        setClientSecretForModal(null);
    }, []); 

    
    const handleRejectRequest = useCallback((request) => {
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
    }, [rejectPaymentRequestMutation]); 


    // Define columns for ReusableTable
    const payrollColumns = useMemo(() => [
        {
            header: 'Employee Name',
            key: 'employeeName',
            headerClassName: 'text-left',
            dataClassName: 'font-medium text-gray-900 dark:text-white',
        },
        {
            header: 'Email',
            key: 'employeeEmail',
            headerClassName: 'text-left',
            dataClassName: 'text-gray-700 dark:text-gray-300',
        },
        {
            header: 'Salary',
            key: 'amount',
            headerClassName: 'text-left',
            dataClassName: 'text-gray-700 dark:text-gray-300',
            render: (request) => `$${request.amount?.toFixed(2) || '0.00'}`,
        },
        {
            header: 'Payment Month',
            key: 'monthYear',
            headerClassName: 'text-left',
            dataClassName: 'text-gray-700 dark:text-gray-300',
            render: (request) => `${request.month} ${request.year}`,
        },
        {
            header: 'Requested By',
            key: 'requestedBy',
            headerClassName: 'text-left',
            dataClassName: 'text-gray-700 dark:text-gray-300',
        },
        {
            header: 'Status',
            key: 'status',
            headerClassName: 'text-center',
            dataClassName: 'text-center',
            render: (request) => (
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    request.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    request.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                    {request.status}
                </span>
            ),
        },
        {
            header: 'Actions',
            key: 'actions',
            headerClassName: 'text-right',
            dataClassName: 'text-right font-medium',
            render: (request) => (
                <div className="flex items-center justify-end space-x-2">
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
                </div>
            ),
        },
    ], [
        approvePaymentRequestMutation.isLoading, 
        rejectPaymentRequestMutation.isLoading, 
        isClientSecretLoading, 
        handlePaySalary, 
        handleRejectRequest 
    ]);

    // renderItem function for ReusableCard
    const renderPayrollCard = useCallback((request) => (
        <div className="flex flex-col space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{request.employeeName}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">Email: {request.employeeEmail}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">Salary: ${request.amount?.toFixed(2) || '0.00'}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">Month: {request.month} {request.year}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">Requested By: {request.requestedBy}</p>
            <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">Status:</span>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    request.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    request.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                    {request.status}
                </span>
            </div>

            <div className="flex space-x-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                {request.status === 'pending' && (
                    <>
                        <button
                            onClick={() => handlePaySalary(request)}
                            className="flex-1 flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors shadow-md"
                            disabled={approvePaymentRequestMutation.isLoading || rejectPaymentRequestMutation.isLoading || isClientSecretLoading}
                        >
                            <FaMoneyBillWave className="mr-2" /> Pay
                        </button>
                        <button
                            onClick={() => handleRejectRequest(request)}
                            className="flex-1 flex items-center justify-center bg-red-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-600 transition-colors shadow-md"
                            disabled={approvePaymentRequestMutation.isLoading || rejectPaymentRequestMutation.isLoading || isClientSecretLoading}
                        >
                            <FaRegTimesCircle className="mr-2" /> Reject
                        </button>
                    </>
                )}
                {request.status === 'approved' && (
                    <span className="text-green-600 flex items-center justify-center w-full">
                        <FaCheckCircle className="mr-1" /> Approved
                    </span>
                )}
                {request.status === 'rejected' && (
                    <span className="text-red-600 flex items-center justify-center w-full">
                        <FaTimesCircle className="mr-1" /> Rejected
                    </span>
                )}
            </div>
        </div>
    ), [
        approvePaymentRequestMutation.isLoading, 
        rejectPaymentRequestMutation.isLoading, 
        isClientSecretLoading, 
        handlePaySalary, 
        handleRejectRequest 
    ]);


    if (authLoading || roleLoading || requestsLoading) {
        return (
           <LoadingSpinner />
        );
    }

    if (requestsError) {
        return (
            <div className="text-red-500 text-center py-10">
                <p>Failed to load pending payment requests: {requestsError.message}</p>
            </div>
        );
    }

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

            {allRequests.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400">No pending salary payments found.</p>
            ) : (
                <>
                    {viewMode === 'table' ? (
                        <ReusableTable
                            columns={payrollColumns}
                            data={currentRequests} 
                            rowKey="_id"
                            renderEmpty={<p className="text-center text-gray-600 dark:text-gray-400">No pending salary payments found for this page.</p>}
                        />
                    ) : (
                        <ReusableCard
                            data={currentRequests} 
                            rowKey="_id"
                            renderItem={renderPayrollCard}
                        />
                    )}
                    
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        itemsPerPage={itemsPerPage}
                        totalItems={allRequests.length}
                    />
                </>
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
                            <div className="flex flex-col items-center justify-center h-40">
                                <svg aria-hidden="true" className="w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9111 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
                                </svg>
                                <p className="mt-3 text-lg font-semibold text-gray-700 dark:text-gray-300">Preparing payment...</p>
                            </div>
                        ) : (
                            clientSecretForModal && (
                                <Elements stripe={stripePromise} options={{ clientSecret: clientSecretForModal }}>
                                    <CheckoutForm
                                        orderAmount={selectedRequest.amount}
                                        employeeName={selectedRequest.employeeName}
                                        employeeEmail={selectedRequest.employeeEmail}
                                        onPaymentSuccess={(transactionId) => {
                                            approvePaymentRequestMutation.mutate({
                                                requestId: selectedRequest._id,
                                                transactionId: transactionId
                                            });
                                        }}
                                        onPaymentError={(errorMessage) => {
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