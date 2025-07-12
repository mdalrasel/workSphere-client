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
    const { role: loggedInUserRole, isLoading: roleLoading } = useUserRole(); 

    // 1. Fetch all users from the server
    const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery({
        queryKey: ['all-users-admin'],
        enabled: !authLoading && !roleLoading && loggedInUserRole === 'Admin', 
        queryFn: async () => {
            const res = await axiosSecure.get('/users'); 
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
                title: "User role updated successfully!",
                showConfirmButton: false,
                timer: 1500,
                background: '#fff',
                color: '#1f2937'
            });
            queryClient.invalidateQueries(['all-users-admin']); 
            queryClient.invalidateQueries(['dashboard-stats']); 
        },
        onError: (error) => {
            Swal.fire({
                icon: "error",
                title: "Role Update Failed",
                text: error.response?.data?.message || "Something went wrong.",
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
                title: "User successfully deleted!",
                showConfirmButton: false,
                timer: 1500,
                background: '#fff',
                color: '#1f2937'
            });
            queryClient.invalidateQueries(['all-users-admin']); 
            queryClient.invalidateQueries(['dashboard-stats']); 
        },
        onError: (error) => {
            Swal.fire({
                icon: "error",
                title: "User Deletion Failed",
                text: error.response?.data?.message || "Something went wrong.",
                confirmButtonColor: "#d33",
                background: '#fff',
                color: '#1f2937'
            });
        },
    });

    // Handle role change from dropdown
    const handleRoleChange = (userItem, event) => {
        const newRole = event.target.value;
        const currentRole = userItem.role;

        // Prevent an admin from changing their own role
        if (user?.email === userItem.email) {
            Swal.fire({
                icon: "error",
                title: "Operation Failed",
                text: "You cannot change your own role!",
                confirmButtonColor: "#d33",
                background: '#fff',
                color: '#1f2937'
            });
            // Reset dropdown to current role if self-change is attempted
            event.target.value = currentRole;
            return;
        }

        if (currentRole === newRole) {
            Swal.fire({
                icon: "info",
                title: "Role is already the same",
                text: `This user's role is already set to ${newRole}.`,
                confirmButtonColor: "#3085d6",
                background: '#fff',
                color: '#1f2937'
            });
            return;
        }

        Swal.fire({
            title: "Are you sure?",
            text: `Do you want to change ${userItem.name}'s role from ${currentRole} to ${newRole}?`,
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
                updateRoleMutation.mutate({ id: userItem._id, newRole });
            } else {
                // If cancelled, revert the dropdown selection
                event.target.value = currentRole;
            }
        });
    };

    // Handle user deletion
    const handleDeleteUser = (id, name, email) => {
        if (user?.email === email) { 
            Swal.fire({
                icon: "error",
                title: "Operation Failed",
                text: "You cannot delete your own account!",
                confirmButtonColor: "#d33",
                background: '#fff',
                color: '#1f2937'
            });
            return;
        }

        Swal.fire({
            title: "Are you sure?",
            text: `Do you want to delete this user named ${name}? This action cannot be undone!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel",
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
                <p>Failed to load user list: {usersError.message}</p>
            </div>
        );
    }

    // If the logged-in user is not an Admin, show Forbidden message
    if (loggedInUserRole !== 'Admin') {
        return (
            <div className="text-red-500 text-center py-10">
                <h3 className="text-2xl font-bold">Access Denied</h3>
                <p className="mt-2">This page is only available for Admins.</p>
            </div>
        );
    }

    // Helper function to get role icon
    const getRoleIcon = (role) => {
        switch (role) {
            case 'Employee':
                return <FaUserTie className="inline-block mr-1" />;
            case 'HR':
                return <FaUserFriends className="inline-block mr-1" />;
            case 'Admin':
                return <FaUserShield className="inline-block mr-1" />;
            default:
                return null;
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-900 dark:text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">Manage Users</h2>

            {users.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400">No users found.</p>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Current Role
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Activities 
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
                                        {getRoleIcon(userItem.role)} {userItem.role || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end space-x-2">
                                        {/* Role Change Dropdown */}
                                        <select
                                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                            value={userItem.role || ''}
                                            onChange={(event) => handleRoleChange(userItem, event)}
                                            disabled={updateRoleMutation.isLoading || userItem.email === user?.email} 
                                            title={userItem.email === user?.email ? "You cannot change your own role" : "Change user role"}
                                        >
                                            <option value="Employee">
                                                <FaUserTie className="inline-block mr-1" /> Employee
                                            </option>
                                            <option value="HR">
                                                <FaUserFriends className="inline-block mr-1" /> HR
                                            </option>
                                            <option value="Admin">
                                                <FaUserShield className="inline-block mr-1" /> Admin
                                            </option>
                                        </select>

                                        <button
                                            className="bg-red-500 text-white px-3 py-2 rounded-md font-semibold hover:bg-red-600 transition-colors duration-200 shadow-md flex items-center justify-center"
                                            title="Delete User" 
                                            onClick={() => handleDeleteUser(userItem._id, userItem.name, userItem.email)}
                                            disabled={deleteUserMutation.isLoading || userItem.email === user?.email} 
                                        >
                                            <FaTrashAlt className="mr-1" /> Delete 
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
