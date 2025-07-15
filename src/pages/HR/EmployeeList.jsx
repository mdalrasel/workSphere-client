import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { FaCheckCircle, FaTimesCircle, FaMoneyBillWave, FaInfoCircle, FaTable, FaThLarge } from 'react-icons/fa'; 
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import LoadingSpinner from '../../utils/LoadingSpinner';
import ReusableTable from '../../utils/ReusableTable';
import Pagination from '../../utils/Pagination';
import ReusableCard from '../../components/cards/ReusableCard';

const EmployeeList = () => {
    const { user, loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
    const navigate = useNavigate();

    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [employeeToPay, setEmployeeToPay] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;
    const [viewMode, setViewMode] = useState('table'); 

   
    const toggleViewMode = useCallback(() => {
        setViewMode((prevMode) => (prevMode === 'table' ? 'card' : 'table'));
    }, []);

    // 1. Fetch all users (employees, HRs, Admins) from the server
    const { data: users = [], isLoading: usersLoading, error: usersError, } = useQuery({
        queryKey: ['all-users'],
        enabled: !authLoading,
        queryFn: async () => {
            const res = await axiosSecure.get('/users');
            return res.data;
        },
    });

    const employees = users.filter(u => u.role === 'Employee');

    const totalPages = Math.ceil(employees.length / itemsPerPage);

    const currentEmployees = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return employees.slice(startIndex, endIndex);
    }, [employees, currentPage, itemsPerPage]);

    const handlePageChange = useCallback((pageNumber) => {
        setCurrentPage(pageNumber);
    }, []);

    // 2. Mutation for toggling verified status
    const toggleVerifiedMutation = useMutation({
        mutationFn: async ({ id, newStatus }) => {
            const res = await axiosSecure.patch(`/users/verify/${id}`, { isVerified: newStatus });
            return res.data;
        },
        onSuccess: () => {
            Swal.fire({
                icon: "success",
                title: "Verification status updated successfully!",
                showConfirmButton: false,
                timer: 1500,
                background: '#fff',
                color: '#1f2937'
            });
            queryClient.invalidateQueries(['all-users']);
        },
        onError: (error) => {
            Swal.fire({
                icon: "error",
                title: "Status Update Failed",
                text: error.response?.data?.message || "Something went wrong.",
                confirmButtonColor: "#d33",
                background: '#fff',
                color: '#1f2937'
            });
        },
    });

    // 3. Mutation for making a payment request
    const makePaymentRequestMutation = useMutation({
        mutationFn: async (paymentData) => {
            const res = await axiosSecure.post('/payment-requests', paymentData);
            return res.data;
        },
        onSuccess: () => {
            Swal.fire({
                icon: "success",
                title: "Payment request sent successfully!",
                showConfirmButton: false,
                timer: 1500,
                background: '#fff',
                color: '#1f2937'
            });
            closePayModal();
            queryClient.invalidateQueries(['pendingPaymentRequests']);
        },
        onError: (error) => {
            Swal.fire({
                icon: "error",
                title: "Request Failed",
                text: error.response?.data?.message || "Something went wrong.",
                confirmButtonColor: "#d33",
                background: '#fff',
                color: '#1f2937'
            });
        },
    });

    const handleToggleVerified = useCallback((id, currentStatus) => {
        Swal.fire({
            title: "Are you sure?",
            text: `Do you want to ${currentStatus ? 'unverify' : 'verify'} this employee's status?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, change it!",
            cancelButtonText: "No, cancel",
            background: '#fff',
            color: '#1f2937'
        }).then((result) => {
            if (result.isConfirmed) {
                toggleVerifiedMutation.mutate({ id, newStatus: !currentStatus });
            }
        });
    }, [toggleVerifiedMutation]);

    // Handle Pay - Opens modal and sets form values
    const handlePay = useCallback((employee) => {
        if (!employee.isVerified) {
            Swal.fire({
                icon: "info",
                title: "Not Verified",
                text: "This employee must be verified before payment can be made.",
                confirmButtonColor: "#3085d6",
                background: '#fff',
                color: '#1f2937'
            });
            return;
        }
        setEmployeeToPay(employee);
        setValue('salary', employee.salary || 0);
        const today = new Date();
        setValue('month', today.toLocaleString('default', { month: 'long' }));
        setValue('year', today.getFullYear());
        setIsPayModalOpen(true);
    }, [setValue]);

    const onPaySubmit = useCallback((data) => {
        if (!employeeToPay) return;

        const paymentData = {
            employeeId: employeeToPay._id,
            employeeUid: employeeToPay.uid,
            employeeEmail: employeeToPay.email,
            employeeName: employeeToPay.name,
            amount: parseFloat(data.salary),
            month: data.month,
            year: parseInt(data.year),
            requestDate: new Date().toISOString(),
            status: 'pending',
            requestedBy: user.email,
        };
        makePaymentRequestMutation.mutate(paymentData);
    }, [employeeToPay, user, makePaymentRequestMutation]);

    const closePayModal = useCallback(() => {
        setIsPayModalOpen(false);
        setEmployeeToPay(null);
        reset();
    }, [reset]);

    // Handle Details - Navigates to EmployeeDetails page
    const handleDetails = useCallback((employeeUid) => {
        if (!employeeUid) {
            Swal.fire({
                icon: "error",
                title: "UID Missing!",
                text: "UID not found for this employee to view details. Please check database entry.",
                confirmButtonColor: "#d33",
                background: '#fff',
                color: '#1f2937'
            });
            return;
        }
        navigate(`/dashboard/employee-details/${employeeUid}`);
    }, [navigate]);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const employeeListColumns = useMemo(() => [
        {
            header: 'Photo & Name', 
            key: 'name',
            headerClassName: 'text-left',
            dataClassName: 'font-medium text-gray-900 dark:text-white',
            render: (employee) => (
                <div className="flex items-center">
                    <img
                        src={employee.photoURL || "https://i.ibb.co/XZfsjds7/Profile.png"}
                        alt={employee.name || 'User'}
                        className="w-8 h-8 rounded-full object-cover mr-2 border border-gray-300 dark:border-gray-600"
                    />
                    {employee.name || 'N/A'}
                </div>
            )
        },
        {
            header: 'Email',
            key: 'email',
            headerClassName: 'text-left',
            dataClassName: 'text-gray-700 dark:text-gray-300'
        },
        {
            header: 'Verified',
            key: 'isVerified',
            headerClassName: 'text-center',
            dataClassName: 'text-center',
            render: (employee) => (
                <button
                    className={`p-1 rounded-full transition-colors duration-200 ${employee.isVerified ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}
                    title={employee.isVerified ? 'Verified: Click to unverify' : 'Not Verified: Click to verify'}
                    onClick={() => handleToggleVerified(employee._id, employee.isVerified)}
                    disabled={toggleVerifiedMutation.isLoading}
                >
                    {employee.isVerified ? <FaCheckCircle size={20} /> : <FaTimesCircle size={20} />}
                </button>
            )
        },
        {
            header: 'Bank Account',
            key: 'bank_account_no',
            headerClassName: 'text-left',
            dataClassName: 'text-gray-700 dark:text-gray-300',
            render: (employee) => employee.bank_account_no || 'N/A'
        },
        {
            header: 'Salary',
            key: 'salary',
            headerClassName: 'text-left',
            dataClassName: 'text-gray-700 dark:text-gray-300',
            render: (employee) => `$${employee.salary ? employee.salary.toFixed(2) : '0.00'}`
        },
        {
            header: 'Actions',
            key: 'actions',
            headerClassName: 'text-right',
            dataClassName: 'text-right font-medium',
            render: (employee) => (
                <div className="flex items-center justify-end space-x-2">
                    {/* Pay Button */}
                    <button
                        className={`text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 mr-3 p-2 rounded-md transition-opacity duration-200 ${employee.isVerified ? '' : 'opacity-50 cursor-not-allowed'}`}
                        disabled={!employee.isVerified || makePaymentRequestMutation.isLoading}
                        title={employee.isVerified ? 'Pay Salary' : 'Not verified, cannot pay salary'}
                        onClick={() => handlePay(employee)}
                    >
                        <FaMoneyBillWave size={20} />
                    </button>
                    {/* Details Button */}
                    <button
                        className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-200 p-2 rounded-md transition-colors duration-200"
                        title="View Details"
                        onClick={() => handleDetails(employee.uid)}
                    >
                        <FaInfoCircle size={20} />
                    </button>
                </div>
            )
        },
    ], [
        handleToggleVerified, toggleVerifiedMutation.isLoading,
        handlePay, makePaymentRequestMutation.isLoading,
        handleDetails
    ]);

    // renderItem function for ReusableCard
    const renderEmployeeCard = useCallback((employee) => (
        <div className="flex flex-col space-y-3">
            <div className="flex items-center">
                <img
                    src={employee.photoURL || "https://i.ibb.co/XZfsjds7/Profile.png"}
                    alt={employee.name || 'User'}
                    className="w-12 h-12 rounded-full object-cover mr-4 border border-gray-300 dark:border-gray-600"
                />
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{employee.name || 'N/A'}</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{employee.email || 'N/A'}</p>
                </div>
            </div>

            <div className="flex justify-between items-center text-gray-700 dark:text-gray-300 text-base">
                <span className="font-medium">Verified:</span>
                <button
                    className={`p-1 rounded-full transition-colors duration-200 ${employee.isVerified ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}
                    title={employee.isVerified ? 'Verified: Click to unverify' : 'Not Verified: Click to verify'}
                    onClick={() => handleToggleVerified(employee._id, employee.isVerified)}
                    disabled={toggleVerifiedMutation.isLoading}
                >
                    {employee.isVerified ? <FaCheckCircle size={20} /> : <FaTimesCircle size={20} />}
                </button>
            </div>

            <div className="flex justify-between items-center text-gray-700 dark:text-gray-300 text-base">
                <span className="font-medium">Bank Account:</span>
                <span>{employee.bank_account_no || 'N/A'}</span>
            </div>

            <div className="flex justify-between items-center text-gray-700 dark:text-gray-300 text-base">
                <span className="font-medium">Salary:</span>
                <span>${employee.salary ? employee.salary.toFixed(2) : '0.00'}</span>
            </div>

            <div className="flex space-x-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                {/* Pay Button */}
                <button
                    className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md font-semibold transition-colors duration-200 shadow-md ${employee.isVerified ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
                    disabled={!employee.isVerified || makePaymentRequestMutation.isLoading}
                    title={employee.isVerified ? 'Pay Salary' : 'Not verified, cannot pay salary'}
                    onClick={() => handlePay(employee)}
                >
                    <FaMoneyBillWave className="mr-2" /> Pay
                </button>
                {/* Details Button */}
                <button
                    className="flex-1 flex items-center justify-center bg-purple-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-purple-700 transition-colors duration-200 shadow-md"
                    title="View Details"
                    onClick={() => handleDetails(employee.uid)}
                >
                    <FaInfoCircle className="mr-2" /> Details
                </button>
            </div>
        </div>
    ), [
        handleToggleVerified, toggleVerifiedMutation.isLoading,
        handlePay, makePaymentRequestMutation.isLoading,
        handleDetails
    ]);

    if (authLoading || usersLoading) {
        return (
            <LoadingSpinner />
        );
    }

    if (usersError) {
        return (
            <div className="text-red-500 text-center py-10">
                <p>Failed to load employee list: {usersError.message}</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-900 dark:text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">Employee List</h2>

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

            {employees.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400">No employees found.</p>
            ) : (
                <>
                    {viewMode === 'table' ? (
                        <ReusableTable
                            columns={employeeListColumns}
                            data={currentEmployees}
                            rowKey="_id"
                            renderEmpty={<p className="text-center text-gray-600 dark:text-gray-400">No employees found for this page.</p>}
                        />
                    ) : (
                        <ReusableCard
                            data={currentEmployees}
                            rowKey="_id"
                            renderItem={renderEmployeeCard} 
                        />
                    )}

                    {/* Pagination Component */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        itemsPerPage={itemsPerPage}
                        totalItems={employees.length}
                    />
                </>
            )}

            {/* Pay Modal */}
            {isPayModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
                        <h3 className="text-2xl font-semibold mb-6 text-center text-gray-900 dark:text-white">Pay Salary</h3>
                        <button
                            onClick={closePayModal}
                            className="absolute top-4 right-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl"
                        >
                            &times;
                        </button>
                        <form onSubmit={handleSubmit(onPaySubmit)} className="grid grid-cols-1 gap-4">
                            <div>
                                <label htmlFor="employeeName" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Employee Name</label>
                                <input
                                    type="text"
                                    id="employeeName"
                                    value={employeeToPay?.name || ''}
                                    readOnly
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label htmlFor="salary" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Salary Amount</label>
                                <input
                                    type="number"
                                    id="salary"
                                    {...register('salary', { 
                                        required: "Salary amount is required", 
                                        min: {
                                            value: 0.01, 
                                            message: "Amount must be greater than 0"
                                        },
                                        valueAsNumber: true 
                                    })}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                />
                                {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary.message}</p>}
                            </div>
                            {/* Month Dropdown */}
                            <div>
                                <label htmlFor="month" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Month</label>
                                <select
                                    id="month"
                                    {...register('month', { required: "Month is required" })}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {months.map((month) => (
                                        <option key={month} value={month}>{month}</option>
                                    ))}
                                </select>
                                {errors.month && <p className="text-red-500 text-sm mt-1">{errors.month.message}</p>}
                            </div>
                            {/* Year Dropdown */}
                            <div>
                                <label htmlFor="year" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Year</label>
                                <select
                                    id="year"
                                    {...register('year', { required: "Year is required" })}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {years.map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>}
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={closePayModal}
                                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md font-semibold hover:bg-gray-400 transition-colors shadow-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors shadow-md"
                                    disabled={makePaymentRequestMutation.isLoading}
                                >
                                    {makePaymentRequestMutation.isLoading ? 'Sending Request...' : 'Send Payment Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeList;