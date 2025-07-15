import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useUserRole from '../../hooks/useUserRole';
import { FaTrashAlt, FaUserFriends, FaUserShield, FaUserTie, FaFireAlt, FaFire } from 'react-icons/fa';
import LoadingSpinner from '../../utils/LoadingSpinner';
import ReusableTable from '../../utils/ReusableTable';
import Pagination from '../../utils/Pagination';

const ManageUsers = () => {
    const { user, loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const { role: loggedInUserRole, isLoading: roleLoading } = useUserRole();

    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 

    // 1. Fetch all users from the server
    const { data: users = [], isLoading: usersLoading, error: usersError} = useQuery({
        queryKey: ['all-users-admin'],
        enabled: !authLoading && !roleLoading && loggedInUserRole === 'Admin',
        queryFn: async () => {
            const res = await axiosSecure.get('/users');
            return res.data;
        },
    });

    const allUsers = useMemo(() => {
        return users; 
    }, [users]);

   
    const totalPages = Math.ceil(allUsers.length / itemsPerPage);

    
    const currentUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return allUsers.slice(startIndex, endIndex);
    }, [allUsers, currentPage, itemsPerPage]);

    
    const handlePageChange = useCallback((pageNumber) => {
        setCurrentPage(pageNumber);
    }, []);

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

    // New: Mutation for toggling user worksheet status
    const toggleWorksheetStatusMutation = useMutation({
        mutationFn: async ({ id, newStatus }) => {
            const res = await axiosSecure.patch(`/users/worksheet-status/${id}`, { isActiveWorkSheet: newStatus });
            return res.data;
        },
        onSuccess: (data, variables) => {
            const statusMessage = variables.newStatus ? "activated" : "deactivated";
            Swal.fire({
                icon: "success",
                title: `User worksheet ${statusMessage} successfully!`,
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
                title: "Worksheet Status Update Failed",
                text: error.response?.data?.message || "Something went wrong.",
                confirmButtonColor: "#d33",
                background: '#fff',
                color: '#1f2937'
            });
        },
    });


    // Handle role change from dropdown
    const handleRoleChange = useCallback((userItem, event) => {
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
            } 
        });
    }, [user, updateRoleMutation]); 

    // Handle user deletion
    const handleDeleteUser = useCallback((id, name, email) => {
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
    }, [user, deleteUserMutation]);

    // New: Handle worksheet status toggle
    const handleToggleWorksheetStatus = useCallback((userItem) => {
        if (user?.email === userItem.email) {
            Swal.fire({
                icon: "error",
                title: "Operation Failed",
                text: "You cannot change your own worksheet status!",
                confirmButtonColor: "#d33",
                background: '#fff',
                color: '#1f2937'
            });
            return;
        }
        
        // Admins and HRs should not have worksheet status.
        if (userItem.role !== 'Employee') {
            Swal.fire({
                icon: "info",
                title: "Invalid Operation",
                text: "Worksheet status can only be changed for Employees.",
                confirmButtonColor: "#3085d6",
                background: '#fff',
                color: '#1f2937'
            });
            return;
        }

        const newStatus = !userItem.isActiveWorkSheet; 
        const actionText = newStatus ? "activate" : "deactivate";

        Swal.fire({
            title: "Are you sure?",
            text: `Do you want to ${actionText} ${userItem.name}'s worksheet access?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: `Yes, ${actionText} it!`,
            cancelButtonText: "No, cancel",
            background: '#fff',
            color: '#1f2937'
        }).then((result) => {
            if (result.isConfirmed) {
                toggleWorksheetStatusMutation.mutate({ id: userItem._id, newStatus });
            }
        });
    }, [user, toggleWorksheetStatusMutation]);

    // Helper function to get role icon
    const getRoleIcon = useCallback((role) => {
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
    }, []); 

    const manageUsersColumns = useMemo(() => [
        {
            header: 'Photo & Name',
            key: 'name',
            headerClassName: 'text-left',
            dataClassName: 'font-medium text-gray-900 dark:text-white',
            render: (userItem) => (
                <div className="flex items-center">
                    <img
                        src={userItem.photoURL || "https://i.ibb.co/XZfsjds7/Profile.png"}
                        alt={userItem.name || 'User'}
                        className="w-8 h-8 rounded-full object-cover mr-2 border border-gray-300 dark:border-gray-600"
                    />
                    {userItem.name || 'N/A'}
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
            header: 'Current Role',
            key: 'role',
            headerClassName: 'text-left',
            dataClassName: 'text-gray-700 dark:text-gray-300 capitalize',
            render: (userItem) => (
                <>
                    {getRoleIcon(userItem.role)} {userItem.role || 'N/A'}
                </>
            )
        },
        {
            header: 'Actions',
            key: 'actions',
            headerClassName: 'text-right',
            dataClassName: 'text-right font-medium',
            render: (userItem) => (
                <div className="flex items-center justify-end space-x-2">
                    {/* Role Change Dropdown */}
                    <select
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        value={userItem.role || ''}
                        onChange={(event) => handleRoleChange(userItem, event)}
                        disabled={updateRoleMutation.isLoading || userItem.email === user?.email}
                        title={userItem.email === user?.email ? "You cannot change your own role" : "Change user role"}
                    >
                        <option value="Employee">Employee</option>
                        <option value="HR">HR</option>
                        <option value="Admin">Admin</option>
                    </select>

                    {/* Toggle Worksheet Status Button */}
                    <button
                        className={`${userItem.isActiveWorkSheet ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'} text-white px-3 py-2 rounded-md font-semibold transition-colors duration-200 shadow-md flex items-center justify-center`}
                        title={userItem.isActiveWorkSheet ? "Deactivate Worksheet" : "Activate Worksheet"}
                        onClick={() => handleToggleWorksheetStatus(userItem)}
                        disabled={toggleWorksheetStatusMutation.isLoading || userItem.email === user?.email || userItem.role !== 'Employee'}
                    >
                        {userItem.isActiveWorkSheet ? <FaFireAlt className="mr-1" /> : <FaFire className="mr-1" />}
                        {userItem.isActiveWorkSheet ? 'Deactivate' : 'Activate'}
                    </button>

                    <button
                        className="bg-red-500 text-white px-3 py-2 rounded-md font-semibold hover:bg-red-600 transition-colors duration-200 shadow-md flex items-center justify-center"
                        title="Delete User"
                        onClick={() => handleDeleteUser(userItem._id, userItem.name, userItem.email)}
                        disabled={deleteUserMutation.isLoading || userItem.email === user?.email}
                    >
                        <FaTrashAlt className="mr-1" /> Delete
                    </button>
                </div>
            )
        },
    ], [
        user?.email, 
        getRoleIcon, 
        handleRoleChange, updateRoleMutation.isLoading, 
        handleDeleteUser, deleteUserMutation.isLoading,
        handleToggleWorksheetStatus, toggleWorksheetStatusMutation.isLoading
    ]);


    if (authLoading || usersLoading || roleLoading) {
        return (
            <LoadingSpinner />
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

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-900 dark:text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">Manage Users</h2>

            {allUsers.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400">No users found.</p>
            ) : (
                <>
                    <ReusableTable
                        columns={manageUsersColumns}
                        data={currentUsers} 
                        rowKey="_id"
                        renderEmpty={<p className="text-center text-gray-600 dark:text-gray-400">No users found for this page.</p>}
                    />
                    
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        itemsPerPage={itemsPerPage}
                        totalItems={allUsers.length}
                    />
                </>
            )}
        </div>
    );
};

export default ManageUsers;