import  { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import axios from 'axios';
import {
    FaCheckCircle, FaTimesCircle, FaEdit, FaSave, FaTimes,
    FaIdCard, FaEnvelope, FaBriefcase, FaMoneyBillAlt, FaUniversity, FaUserTag,
    FaUser, FaCamera
} from 'react-icons/fa';

// Check if VITE_IMGBB_API_KEY is defined
const imgbbApiKey = import.meta.env.VITE_IMGBB_API_KEY;
if (!imgbbApiKey) {
    console.error("ERROR: VITE_IMGBB_API_KEY is not defined in your .env file. Image upload functionality will not work.");
}
const image_hosting_api = `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`;

const UserProfile = () => {
    const { user, loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const [isEditing, setIsEditing] = useState(false);

    const { data: userData = {}, isLoading: userLoading, error: userError } = useQuery({
        queryKey: ['user-profile', user?.email],
        enabled: !!user?.email && !authLoading,
        queryFn: async () => {
            const res = await axiosSecure.get(`/users?email=${user.email}`);
            return res.data;
        },
    });

    useEffect(() => {
        if (userData && !userLoading) {
            setValue('name', userData.name || user?.displayName || '');
            setValue('designation', userData.designation || '');
            setValue('bank_account_no', userData.bank_account_no || '');
        }
    }, [userData, userLoading, user, setValue]);

    const updateUserMutation = useMutation({
        mutationFn: async (updatedProfileData) => {
            let photoUrlToSave = userData.photoURL || user?.photoURL || "https://i.ibb.co/2kRZ3mZ/default-user.png";

            if (updatedProfileData.imageFile && updatedProfileData.imageFile[0]) {
                if (!imgbbApiKey) {
                    Swal.fire({
                        icon: "error",
                        title: "Image Upload Disabled",
                        text: "Image hosting API key is missing. Please configure VITE_IMGBB_API_KEY in your .env file.",
                        confirmButtonColor: "#d33",
                        background: '#fff',
                        color: '#1f2937'
                    });
                    throw new Error("Image hosting API key is missing.");
                }

                const formData = new FormData();
                formData.append('image', updatedProfileData.imageFile[0]);
                try {
                   
                    const imgbbRes = await axios.post(image_hosting_api, formData, {
                        headers: {
                            'content-type': 'multipart/form-data',
                        },
                    });
                    if (imgbbRes.data.success) {
                        photoUrlToSave = imgbbRes.data.data.display_url;
                       
                    } else {
                        
                        throw new Error(`Image upload failed: ${imgbbRes.data.error?.message || 'ImgBB response not successful'}`);
                    }
                } catch (imgError) {
                   
                    Swal.fire({
                        icon: "error",
                        title: "Image Upload Failed",
                        text: imgError.message || "There was an issue uploading the image. Please try again.",
                        confirmButtonColor: "#d33",
                        background: '#fff',
                        color: '#1f2937'
                    });
                    throw imgError;
                }
            }

            const payloadToSend = {
                name: updatedProfileData.name,
                photoURL: photoUrlToSave,
                designation: updatedProfileData.designation,
                bank_account_no: updatedProfileData.bank_account_no,
            };

            const res = await axiosSecure.put(`/users/${user.email}`, payloadToSend);
            return res.data;
        },
        onSuccess: () => {
            Swal.fire({
                icon: "success",
                title: "Profile updated successfully!",
                showConfirmButton: false,
                timer: 1500,
                background: '#fff',
                color: '#1f2937'
            });
            setIsEditing(false);
            queryClient.invalidateQueries(['user-profile', user?.email]);
            queryClient.invalidateQueries(['all-users']); // Invalidate all users to ensure lists are updated
            queryClient.invalidateQueries(['all-users-admin']); // Invalidate admin's user list
            queryClient.invalidateQueries(['all-users-for-payment-history']); // Invalidate HR's payment history user list
            queryClient.invalidateQueries(['all-users-for-progress']); // Invalidate HR's progress user list
        },
        onError: (error) => {
            Swal.fire({
                icon: "error",
                title: "Profile Update Failed",
                text: error.response?.data?.message || "Something went wrong. Please check console for details.",
                confirmButtonColor: "#d33",
                background: '#fff',
                color: '#1f2937'
            });
        },
    });

    const onSubmit = (data) => {
        updateUserMutation.mutate(data);
    };

    if (authLoading || userLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
            </div>
        );
    }

    if (userError) {
        return (
            <div className="text-red-500 text-center py-10">
                <p>Failed to load profile data: {userError.message}</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-900 dark:text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">My Profile</h2>

            <div className="flex flex-col items-center mb-8">
                <img
                    src={userData.photoURL || user?.photoURL || "https://i.ibb.co/2kRZ3mZ/default-user.png"}
                    alt="Profile Picture"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-600 dark:border-blue-400 shadow-lg"
                />
                <p className="mt-4 text-2xl font-semibold">{userData.name || user?.displayName || "User"}</p>
                <p className="text-gray-600 dark:text-gray-400">{userData.email || user?.email}</p>
                <span className="text-sm text-blue-600 dark:text-blue-400 capitalize font-medium mt-1">
                    {userData.role || 'Employee'}
                </span>
            </div>

            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                <h3 className="text-2xl font-semibold mb-4 text-center">Profile Information</h3>

                {!isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-700 dark:text-gray-300">
                        <div className="flex items-center">
                            <FaIdCard className="text-blue-600 dark:text-blue-400 mr-3 text-xl" />
                            <p><strong>User ID:</strong> {userData.uid || 'N/A'}</p> {/* Changed to uid */}
                        </div>
                        <div className="flex items-center">
                            <FaEnvelope className="text-blue-600 dark:text-blue-400 mr-3 text-xl" />
                            <p><strong>Email:</strong> {userData.email || user?.email || 'N/A'}</p>
                        </div>
                        <div className="flex items-center">
                            <FaBriefcase className="text-blue-600 dark:text-blue-400 mr-3 text-xl" />
                            <p><strong>Designation:</strong> {userData.designation || 'N/A'}</p>
                        </div>
                        <div className="flex items-center">
                            <FaMoneyBillAlt className="text-blue-600 dark:text-blue-400 mr-3 text-xl" />
                            <p><strong>Salary:</strong> ${userData.salary ? userData.salary.toFixed(2) : '0.00'}</p>
                        </div>
                        <div className="flex items-center">
                            <FaUniversity className="text-blue-600 dark:text-blue-400 mr-3 text-xl" />
                            <p><strong>Bank Account No:</strong> {userData.bank_account_no || 'N/A'}</p>
                        </div>
                        <div className="flex items-center">
                            <FaUserTag className="text-blue-600 dark:text-blue-400 mr-3 text-xl" />
                            <p><strong>Role:</strong> {userData.role || 'N/A'}</p>
                        </div>
                        <div className="md:col-span-2 flex items-center">
                            <strong>Verified:</strong>
                            <span className="ml-2 flex items-center">
                                {userData.isVerified ? (
                                    <span className="text-green-600 flex items-center">
                                        Yes <FaCheckCircle className="ml-1" />
                                    </span>
                                ) : (
                                    <span className="text-red-600 flex items-center">
                                        No <FaTimesCircle className="ml-1" />
                                    </span>
                                )}
                            </span>
                        </div>
                        <div className="md:col-span-2 flex justify-center mt-6">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors shadow-md flex items-center"
                            >
                                <FaEdit className="mr-2" /> Edit Profile
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 flex items-center">
                                <FaUser className="mr-2 text-lg text-blue-600 dark:text-blue-400" /> Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                {...register('name', { required: "Name is required" })}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                        </div>
                        {/* Email Field (Read-only) */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 flex items-center">
                                <FaEnvelope className="mr-2 text-lg text-blue-600 dark:text-blue-400" /> Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={userData.email || user?.email || ''}
                                readOnly
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                            />
                        </div>
                        {/* Photo Upload Field */}
                        <div>
                            <label htmlFor="imageFile" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 flex items-center">
                                <FaCamera className="mr-2 text-lg text-blue-600 dark:text-blue-400" /> Upload Photo
                            </label>
                            <input
                                type="file"
                                id="imageFile"
                                {...register('imageFile')}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Selecting a new photo will update the current one.</p>
                        </div>
                        {/* Designation Field */}
                        <div>
                            <label htmlFor="designation" className=" text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 flex items-center">
                                <FaBriefcase className="mr-2 text-lg text-blue-600 dark:text-blue-400" /> Designation
                            </label>
                            <input
                                type="text"
                                id="designation"
                                {...register('designation')}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., Sales Assistant"
                            />
                        </div>
                        {/* Bank Account No Field */}
                        <div>
                            <label htmlFor="bank_account_no" className=" text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 flex items-center">
                                <FaUniversity className="mr-2 text-lg text-blue-600 dark:text-blue-400" /> Bank Account No
                            </label>
                            <input
                                type="text"
                                id="bank_account_no"
                                {...register('bank_account_no')}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., 1234567890"
                            />
                        </div>
                        
                        {/* Role Field (Read-only) */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 flex items-center">
                                <FaUserTag className="mr-2 text-lg text-blue-600 dark:text-blue-400" /> Role
                            </label>
                            <input
                                type="text"
                                id="role"
                                value={userData.role || 'Employee'}
                                readOnly
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                            />
                        </div>
                       

                        <div className="md:col-span-2 flex justify-end gap-4 mt-6">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md font-semibold hover:bg-gray-400 transition-colors shadow-md flex items-center"
                            >
                                <FaTimes className="mr-2" /> Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors shadow-md flex items-center"
                                disabled={updateUserMutation.isLoading}
                            >
                                {updateUserMutation.isLoading ? 'Updating...' : <><FaSave className="mr-2" /> Update Profile</>}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
