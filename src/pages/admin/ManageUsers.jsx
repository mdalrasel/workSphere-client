// src/pages/dashboard/ManageUsers.jsx
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useUserRole from '../../hooks/useUserRole'; 
import { FaTrashAlt, FaUserFriends, FaUserShield, FaUserTie } from 'react-icons/fa';

const ManageUsers = () => {
    const { user, loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const { role: loggedInUserRole, isLoading: roleLoading } = useUserRole(); // লগইন করা ইউজারের রোল

    // 1. Fetch all users from the server
    const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery({
        queryKey: ['all-users-admin'],
        enabled: !authLoading && !roleLoading && loggedInUserRole === 'Admin', // অ্যাডমিন হলে তবেই ফেচ করবে
        queryFn: async () => {
            const res = await axiosSecure.get('/users'); // এই API সকল ইউজার দেয়
            return res.data;
        },
    });

    // 2. Mutation for updating user role
    const updateRoleMutation = useMutation({
        mutationFn: async ({ id, newRole }) => {
            const res = await axiosSecure.patch(`/users/role/${id}`, { role: newRole });
            return res.data;
        },
        onSuccess: () => {
            Swal.fire({
                icon: "success",
                title: "ইউজারের রোল সফলভাবে আপডেট হয়েছে!",
                showConfirmButton: false,
                timer: 1500,
                background: '#fff',
                color: '#1f2937'
            });
            queryClient.invalidateQueries(['all-users-admin']); // ডেটা রি-ফেচ করুন
            queryClient.invalidateQueries(['dashboard-stats']); // ড্যাশবোর্ড স্ট্যাটস আপডেট হতে পারে
        },
        onError: (error) => {
            console.error("ইউজারের রোল আপডেট করতে ব্যর্থ:", error);
            Swal.fire({
                icon: "error",
                title: "রোল আপডেট ব্যর্থ",
                text: error.response?.data?.message || "কিছু ভুল হয়েছে।",
                confirmButtonColor: "#d33",
                background: '#fff',
                color: '#1f2937'
            });
        },
    });

    // 3. Mutation for deleting a user
    const deleteUserMutation = useMutation({
        mutationFn: async (id) => {
            const res = await axiosSecure.delete(`/users/${id}`);
            return res.data;
        },
        onSuccess: () => {
            Swal.fire({
                icon: "success",
                title: "ইউজার সফলভাবে মুছে ফেলা হয়েছে!",
                showConfirmButton: false,
                timer: 1500,
                background: '#fff',
                color: '#1f2937'
            });
            queryClient.invalidateQueries(['all-users-admin']); // ডেটা রি-ফেচ করুন
            queryClient.invalidateQueries(['dashboard-stats']); // ড্যাশবোর্ড স্ট্যাটস আপডেট হতে পারে
        },
        onError: (error) => {
            console.error("ইউজার মুছতে ব্যর্থ:", error);
            Swal.fire({
                icon: "error",
                title: "ইউজার মোছা ব্যর্থ",
                text: error.response?.data?.message || "কিছু ভুল হয়েছে।",
                confirmButtonColor: "#d33",
                background: '#fff',
                color: '#1f2937'
            });
        },
    });

    // Handle role change
    const handleRoleChange = (id, currentRole, newRole) => {
        if (currentRole === newRole) {
            Swal.fire({
                icon: "info",
                title: "রোল একই আছে",
                text: `এই ইউজারের রোল ইতিমধ্যেই ${newRole} সেট করা আছে।`,
                confirmButtonColor: "#3085d6",
                background: '#fff',
                color: '#1f2937'
            });
            return;
        }

        Swal.fire({
            title: "আপনি কি নিশ্চিত?",
            text: `আপনি কি এই ইউজারের রোল ${currentRole} থেকে ${newRole} এ পরিবর্তন করতে চান?`,
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
                updateRoleMutation.mutate({ id, newRole });
            }
        });
    };

    // Handle user deletion
    const handleDeleteUser = (id, name) => {
        if (user?.uid === id) { // নিজের অ্যাকাউন্ট ডিলিট করতে পারবে না
            Swal.fire({
                icon: "error",
                title: "অপারেশন ব্যর্থ",
                text: "আপনি নিজের অ্যাকাউন্ট ডিলিট করতে পারবেন না!",
                confirmButtonColor: "#d33",
                background: '#fff',
                color: '#1f2937'
            });
            return;
        }

        Swal.fire({
            title: "আপনি কি নিশ্চিত?",
            text: `আপনি কি ${name} নামের এই ইউজারকে মুছে ফেলতে চান? এই অ্যাকশনটি পূর্বাবস্থায় ফেরানো যাবে না!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "হ্যাঁ, মুছে ফেলুন!",
            cancelButtonText: "না, বাতিল করুন",
            background: '#fff',
            color: '#1f2937'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteUserMutation.mutate(id);
            }
        });
    };

    if (authLoading || usersLoading || roleLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
            </div>
        );
    }

    if (usersError) {
        return (
            <div className="text-red-500 text-center py-10">
                <p>ব্যবহারকারী তালিকা লোড করতে সমস্যা হয়েছে: {usersError.message}</p>
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
            <h2 className="text-3xl font-bold mb-6 text-center">ব্যবহারকারী পরিচালনা</h2>

            {users.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400">কোনো ব্যবহারকারী পাওয়া যায়নি।</p>
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
                                    বর্তমান রোল
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    অ্যাকশন
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {users.map((userItem) => (
                                <tr key={userItem._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {userItem.name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                        {userItem.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 capitalize">
                                        {userItem.role || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {/* Make Employee Button */}
                                        <button
                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 mr-2 p-2 rounded-md transition-colors duration-200"
                                            title="Employee করুন"
                                            onClick={() => handleRoleChange(userItem._id, userItem.role, 'Employee')}
                                            disabled={updateRoleMutation.isLoading || userItem.role === 'Employee'}
                                        >
                                            <FaUserTie size={20} />
                                        </button>
                                        {/* Make HR Button */}
                                        <button
                                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200 mr-2 p-2 rounded-md transition-colors duration-200"
                                            title="HR করুন"
                                            onClick={() => handleRoleChange(userItem._id, userItem.role, 'HR')}
                                            disabled={updateRoleMutation.isLoading || userItem.role === 'HR'}
                                        >
                                            <FaUserFriends size={20} />
                                        </button>
                                        {/* Make Admin Button */}
                                        <button
                                            className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-200 mr-2 p-2 rounded-md transition-colors duration-200"
                                            title="Admin করুন"
                                            onClick={() => handleRoleChange(userItem._id, userItem.role, 'Admin')}
                                            disabled={updateRoleMutation.isLoading || userItem.role === 'Admin'}
                                        >
                                            <FaUserShield size={20} />
                                        </button>
                                        {/* Delete User Button */}
                                        <button
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-2 rounded-md transition-colors duration-200"
                                            title="ইউজার মুছুন"
                                            onClick={() => handleDeleteUser(userItem._id, userItem.name)}
                                            disabled={deleteUserMutation.isLoading || userItem.uid === user?.uid} // নিজের অ্যাকাউন্ট মুছতে পারবে না
                                        >
                                            <FaTrashAlt size={20} />
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

export default ManageUsers;
