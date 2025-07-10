// src/pages/dashboard/EmployeeList.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { FaCheckCircle, FaTimesCircle, FaMoneyBillWave, FaInfoCircle } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

const EmployeeList = () => {
    const { user, loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
    const navigate = useNavigate();

    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [employeeToPay, setEmployeeToPay] = useState(null);

    // 1. Fetch all users (employees, HRs, Admins) from the server
    const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery({
        queryKey: ['all-users'],
        enabled: !authLoading,
        queryFn: async () => {
            const res = await axiosSecure.get('/users');
            return res.data;
        },
    });

    // শুধুমাত্র 'Employee' রোলের ইউজারদের ফিল্টার করুন
    const employees = users.filter(u => u.role === 'Employee');

    // 2. Mutation for toggling isVerified status
    const toggleVerifiedMutation = useMutation({
        mutationFn: async ({ id, newStatus }) => {
            const res = await axiosSecure.patch(`/users/verify/${id}`, { isVerified: newStatus });
            return res.data;
        },
        onSuccess: () => {
            Swal.fire({
                icon: "success",
                title: "যাচাইকরণ স্ট্যাটাস সফলভাবে আপডেট হয়েছে!",
                showConfirmButton: false,
                timer: 1500,
                background: '#fff',
                color: '#1f2937'
            });
            queryClient.invalidateQueries(['all-users']);
        },
        onError: (error) => {
            console.error("যাচাইকরণ স্ট্যাটাস আপডেট করতে ব্যর্থ:", error);
            Swal.fire({
                icon: "error",
                title: "স্ট্যাটাস আপডেট ব্যর্থ",
                text: error.response?.data?.message || "কিছু ভুল হয়েছে।",
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
                title: "বেতন পরিশোধের অনুরোধ সফলভাবে পাঠানো হয়েছে!",
                showConfirmButton: false,
                timer: 1500,
                background: '#fff',
                color: '#1f2937'
            });
            closePayModal();
        },
        onError: (error) => {
            console.error("বেতন পরিশোধের অনুরোধ পাঠাতে ব্যর্থ:", error);
            Swal.fire({
                icon: "error",
                title: "অনুরোধ পাঠাতে ব্যর্থ",
                text: error.response?.data?.message || "কিছু ভুল হয়েছে।",
                confirmButtonColor: "#d33",
                background: '#fff',
                color: '#1f2937'
            });
        },
    });

    // Handle toggle verified status
    const handleToggleVerified = (id, currentStatus) => {
        Swal.fire({
            title: "আপনি কি নিশ্চিত?",
            text: `আপনি কি এই কর্মচারীর যাচাইকরণ স্ট্যাটাস ${currentStatus ? 'অযাচাইকৃত' : 'যাচাইকৃত'} করতে চান?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "হ্যাঁ, পরিবর্তন করুন!",
            cancelButtonText: "না, বাতিল করুন",
            background: '#fff',
            color: '#1f2937'
        }).then((result) => {
            if (result.isConfirmed) {
                toggleVerifiedMutation.mutate({ id, newStatus: !currentStatus });
            }
        });
    };

    // Handle Pay - Opens modal and sets form values
    const handlePay = (employee) => {
        if (!employee.isVerified) {
            Swal.fire({
                icon: "info",
                title: "যাচাইকৃত নয়",
                text: "এই কর্মচারীকে বেতন দিতে হলে প্রথমে তাকে যাচাইকৃত করতে হবে।",
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
    };

    // Pay form submission handler
    const onPaySubmit = (data) => {
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
    };

    // Modal বন্ধ করার ফাংশন
    const closePayModal = () => {
        setIsPayModalOpen(false);
        setEmployeeToPay(null);
        reset();
    };

    // Handle Details - Navigates to EmployeeDetails page
    const handleDetails = (employeeUid) => {
        // DEBUG: EmployeeList থেকে পাঠানো UID কনসোল করুন
        console.log("EmployeeList - Navigating with UID:", employeeUid);
        
        if (!employeeUid) {
            Swal.fire({
                icon: "error",
                title: "UID অনুপস্থিত!",
                text: "এই কর্মচারীর বিস্তারিত তথ্য দেখার জন্য UID পাওয়া যায়নি। ডেটাবেস এন্ট্রি চেক করুন।",
                confirmButtonColor: "#d33",
                background: '#fff',
                color: '#1f2937'
            });
            return;
        }
        navigate(`/dashboard/employee-details/${employeeUid}`);
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    if (authLoading || usersLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
            </div>
        );
    }

    if (usersError) {
        return (
            <div className="text-red-500 text-center py-10">
                <p>কর্মচারী তালিকা লোড করতে সমস্যা হয়েছে: {usersError.message}</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-900 dark:text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">কর্মচারী তালিকা</h2>

            {employees.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400">কোনো কর্মচারী পাওয়া যায়নি।</p>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    নাম
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    ইমেইল
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    যাচাইকৃত
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    ব্যাংক অ্যাকাউন্ট
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    বেতন
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    অ্যাকশন
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {employees.map((employee) => (
                                <tr key={employee._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {employee.name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {employee.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                        {/* Verified Status - Now interactive */}
                                        <button 
                                            className={`p-1 rounded-full transition-colors duration-200 ${employee.isVerified ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}
                                            title={employee.isVerified ? 'যাচাইকৃত: ক্লিক করে অযাচাইকৃত করুন' : 'যাচাইকৃত নয়: ক্লিক করে যাচাইকৃত করুন'}
                                            onClick={() => handleToggleVerified(employee._id, employee.isVerified)}
                                            disabled={toggleVerifiedMutation.isLoading}
                                        >
                                            {employee.isVerified ? <FaCheckCircle size={20} /> : <FaTimesCircle size={20} />}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {employee.bank_account_no || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        ${employee.salary ? employee.salary.toFixed(2) : '0.00'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {/* Pay Button */}
                                        <button 
                                            className={`text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 mr-3 p-2 rounded-md transition-opacity duration-200 ${employee.isVerified ? '' : 'opacity-50 cursor-not-allowed'}`}
                                            disabled={!employee.isVerified || makePaymentRequestMutation.isLoading}
                                            title={employee.isVerified ? 'বেতন দিন' : 'যাচাইকৃত নয়, বেতন দেওয়া যাবে না'}
                                            onClick={() => handlePay(employee)}
                                        >
                                            <FaMoneyBillWave size={20} />
                                        </button>
                                        {/* Details Button */}
                                        <button 
                                            className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-200 p-2 rounded-md transition-colors duration-200"
                                            title="বিস্তারিত দেখুন"
                                            onClick={() => handleDetails(employee.uid)}
                                        >
                                            <FaInfoCircle size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pay Modal */}
            {isPayModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
                        <h3 className="text-2xl font-semibold mb-6 text-center text-gray-900 dark:text-white">বেতন পরিশোধ করুন</h3>
                        <button
                            onClick={closePayModal}
                            className="absolute top-4 right-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl"
                        >
                            &times; {/* Close button icon */}
                        </button>
                        <form onSubmit={handleSubmit(onPaySubmit)} className="grid grid-cols-1 gap-4">
                            {/* Employee Name (Read-only) */}
                            <div>
                                <label htmlFor="employeeName" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">কর্মচারীর নাম</label>
                                <input
                                    type="text"
                                    id="employeeName"
                                    value={employeeToPay?.name || ''}
                                    readOnly
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                                />
                            </div>
                            {/* Salary (Read-only) */}
                            <div>
                                <label htmlFor="salary" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">বেতন</label>
                                <input
                                    type="number"
                                    id="salary"
                                    {...register('salary', { required: "বেতন আবশ্যক", min: 0 })}
                                    readOnly // বেতন এডিট করা যাবে না, শুধু দেখা যাবে
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                                />
                                {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary.message}</p>}
                            </div>
                            {/* Month Dropdown */}
                            <div>
                                <label htmlFor="month" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">মাস</label>
                                <select
                                    id="month"
                                    {...register('month', { required: "মাস আবশ্যক" })}
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
                                <label htmlFor="year" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">বছর</label>
                                <select
                                    id="year"
                                    {...register('year', { required: "বছর আবশ্যক" })}
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
                                    বাতিল করুন
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors shadow-md"
                                    disabled={makePaymentRequestMutation.isLoading}
                                >
                                    {makePaymentRequestMutation.isLoading ? 'অনুরোধ পাঠানো হচ্ছে...' : 'বেতন পরিশোধের অনুরোধ পাঠান'}
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
