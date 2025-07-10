// src/pages/dashboard/EmployeeList.jsx
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // useMutation, useQueryClient ইম্পোর্ট করুন
import Swal from 'sweetalert2'; // Swal ইম্পোর্ট করুন
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { FaCheckCircle, FaTimesCircle, FaMoneyBillWave, FaInfoCircle } from 'react-icons/fa';

const EmployeeList = () => {
    const {  loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient(); // QueryClient নিন

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
            // ডেটা রি-ফেচ করার জন্য invalidateQueries
            queryClient.invalidateQueries(['all-users']); // সকল ইউজার ডেটা রি-ফেচ করুন
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

    // Placeholder for Pay function (will be implemented later)
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
        console.log("Pay employee:", employee.email);
        // Implement modal for payment here
        Swal.fire({
            icon: "info",
            title: "বেতন কার্যকারিতা",
            text: `বেতন কার্যকারিতা শীঘ্রই যোগ করা হবে ${employee.name} এর জন্য।`,
            confirmButtonColor: "#3085d6",
            background: '#fff',
            color: '#1f2937'
        });
    };

    // Placeholder for Details function (will be implemented later)
    const handleDetails = (employeeEmail) => {
        console.log("View details for:", employeeEmail);
        // Implement navigation to details page here
        Swal.fire({
            icon: "info",
            title: "বিস্তারিত কার্যকারিতা",
            text: `বিস্তারিত কার্যকারিতা শীঘ্রই যোগ করা হবে ${employeeEmail} এর জন্য।`,
            confirmButtonColor: "#3085d6",
            background: '#fff',
            color: '#1f2937'
        });
    };

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
                                            disabled={toggleVerifiedMutation.isLoading} // লোডিং অবস্থায় বাটন disabled
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
                                            disabled={!employee.isVerified} // Unverified হলে disabled
                                            title={employee.isVerified ? 'বেতন দিন' : 'যাচাইকৃত নয়, বেতন দেওয়া যাবে না'}
                                            onClick={() => handlePay(employee)}
                                        >
                                            <FaMoneyBillWave size={20} />
                                        </button>
                                        {/* Details Button */}
                                        <button 
                                            className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-200 p-2 rounded-md transition-colors duration-200"
                                            title="বিস্তারিত দেখুন"
                                            onClick={() => handleDetails(employee.email)}
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
        </div>
    );
};

export default EmployeeList;
