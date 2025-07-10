// src/pages/dashboard/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import axios from 'axios'; // সাধারণ axios ইম্পোর্ট করুন imgbb এর জন্য
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'; // আইকন ইম্পোর্ট করুন

const image_hosting_api = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`;

const UserProfile = () => {
    const { user, loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const [isEditing, setIsEditing] = useState(false); // এডিট মোড টগল করার জন্য

    // 1. Fetch user data from your server (including role, designation, bank_account_no, etc.)
    const { data: userData = {}, isLoading: userLoading, error: userError } = useQuery({
        queryKey: ['user-profile', user?.email],
        enabled: !!user?.email && !authLoading, // user.email আছে এবং authLoading শেষ হলে ফেচ করুন
        queryFn: async () => {
            const res = await axiosSecure.get(`/users?email=${user.email}`);
            return res.data;
        },
    });

    // যখন userData লোড হবে বা আপডেট হবে, তখন ফর্ম ফিল্ডগুলো সেট করুন
    useEffect(() => {
        if (userData && !userLoading) {
            setValue('name', userData.name || user?.displayName || '');
            setValue('designation', userData.designation || '');
            setValue('bank_account_no', userData.bank_account_no || '');
            // email, role, salary, isVerified readOnly থাকবে, তাই এদের setValue করার দরকার নেই
            // photoURL ফিল্ডটি ফাইল ইনপুটের জন্য setValue করার প্রয়োজন নেই
        }
    }, [userData, userLoading, user, setValue]);

    // 2. Mutation for updating user profile
    const updateUserMutation = useMutation({
        mutationFn: async (updatedProfileData) => {
            // photoUrlToSave কে বর্তমান userData.photoURL দিয়ে ইনিশিয়ালাইজ করুন
            let photoUrlToSave = userData.photoURL; 

            // imgbb তে ছবি আপলোড করুন যদি নতুন ছবি থাকে
            if (updatedProfileData.imageFile && updatedProfileData.imageFile[0]) {
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
                        throw new Error("ছবি আপলোড ব্যর্থ হয়েছে");
                    }
                } catch (imgError) {
                    console.error("ছবি আপলোড এরর:", imgError);
                    Swal.fire({
                        icon: "error",
                        title: "ছবি আপলোড ব্যর্থ",
                        text: "ছবি আপলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
                        confirmButtonColor: "#d33",
                        background: '#fff',
                        color: '#1f2937'
                    });
                    return Promise.reject(imgError); // মিউটেশন ব্যর্থ করুন
                }
            }

            // সার্ভারে ডেটা আপডেট করুন
            const res = await axiosSecure.put(`/users/${user.email}`, {
                name: updatedProfileData.name,
                photoURL: photoUrlToSave, // এখানে আপডেট করা বা আগের URL ব্যবহার করা হচ্ছে
                designation: updatedProfileData.designation,
                bank_account_no: updatedProfileData.bank_account_no,
                uid: user.uid // UID ও পাঠান অথরাইজেশন চেকের জন্য
            });
            return res.data;
        },
        onSuccess: () => {
            Swal.fire({
                icon: "success",
                title: "প্রোফাইল সফলভাবে আপডেট হয়েছে!",
                showConfirmButton: false,
                timer: 1500,
                background: '#fff',
                color: '#1f2937'
            });
            setIsEditing(false); // এডিট মোড বন্ধ করুন
            queryClient.invalidateQueries(['user-profile', user?.email]); // প্রোফাইল ডেটা রি-ফেচ করুন
        },
        onError: (error) => {
            console.error("প্রোফাইল আপডেট করতে ব্যর্থ:", error);
            Swal.fire({
                icon: "error",
                title: "প্রোফাইল আপডেট করতে ব্যর্থ",
                text: error.response?.data?.message || "কিছু ভুল হয়েছে।",
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
                <p>প্রোফাইল ডেটা লোড করতে সমস্যা হয়েছে: {userError.message}</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-900 dark:text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">আমার প্রোফাইল</h2>

            <div className="flex flex-col items-center mb-8">
                <img
                    src={userData.photoURL || user?.photoURL || "https://i.ibb.co/2kRZ3mZ/default-user.png"}
                    alt="প্রোফাইল ছবি"
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-600 dark:border-blue-400 shadow-lg"
                />
                <p className="mt-4 text-2xl font-semibold">{userData.name || user?.displayName || "ব্যবহারকারী"}</p>
                <p className="text-gray-600 dark:text-gray-400">{userData.email || user?.email}</p>
                <span className="text-sm text-blue-600 dark:text-blue-400 capitalize font-medium mt-1">
                    {userData.role || 'Employee'}
                </span>
            </div>

            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                <h3 className="text-2xl font-semibold mb-4 text-center">প্রোফাইল তথ্য</h3>
                
                {!isEditing ? (
                    <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        {/* _id প্রদর্শন */}
                        <p><strong>ইউজার আইডি:</strong> {userData._id || 'N/A'}</p>
                        <p><strong>ইমেইল:</strong> {userData.email || user?.email || 'N/A'}</p>
                        <p><strong>পদবী:</strong> {userData.designation || 'N/A'}</p>
                        <p><strong>বেতন:</strong> ${userData.salary ? userData.salary.toFixed(2) : '0.00'}</p>
                        <p><strong>ব্যাংক অ্যাকাউন্ট নং:</strong> {userData.bank_account_no || 'N/A'}</p>
                        <p><strong>ভূমিকা:</strong> {userData.role || 'N/A'}</p> {/* ভূমিকা প্রদর্শন */}
                        {/* Verified Status Display */}
                        <p className="flex items-center">
                            <strong>যাচাইকৃত:</strong>
                            <span className="ml-2">
                                {userData.isVerified ? (
                                    <span className="text-green-600 flex items-center">
                                        হ্যাঁ <FaCheckCircle className="ml-1" />
                                    </span>
                                ) : (
                                    <span className="text-red-600 flex items-center">
                                        না <FaTimesCircle className="ml-1" />
                                    </span>
                                )}
                            </span>
                        </p>
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors shadow-md"
                            >
                                প্রোফাইল এডিট করুন
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-1">নাম</label>
                            <input
                                type="text"
                                id="name"
                                {...register('name', { required: "নাম আবশ্যক" })}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                        </div>
                        {/* ইমেইল ফিল্ড - শুধুমাত্র দেখার জন্য (disabled) */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1">ইমেইল</label>
                            <input
                                type="email"
                                id="email"
                                value={userData.email || user?.email || ''}
                                readOnly // এডিট করা যাবে না
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                            />
                        </div>
                        {/* ছবি URL ইনপুট ফিল্ডটি সরানো হয়েছে */}
                        <div>
                            <label htmlFor="imageFile" className="block text-sm font-medium mb-1">ছবি আপলোড করুন (ImgBB)</label>
                            <input
                                type="file"
                                id="imageFile"
                                {...register('imageFile')}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">একটি নতুন ছবি নির্বাচন করলে বর্তমান ছবিটি আপডেট হবে।</p>
                        </div>
                        <div>
                            <label htmlFor="designation" className="block text-sm font-medium mb-1">পদবী</label>
                            <input
                                type="text"
                                id="designation"
                                {...register('designation')}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                placeholder="যেমন: Sales Assistant"
                            />
                        </div>
                        <div>
                            <label htmlFor="bank_account_no" className="block text-sm font-medium mb-1">ব্যাংক অ্যাকাউন্ট নং</label>
                            <input
                                type="text"
                                id="bank_account_no"
                                {...register('bank_account_no')}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                placeholder="যেমন: 1234567890"
                            />
                        </div>
                        {/* বেতন ফিল্ড - শুধুমাত্র দেখার জন্য (disabled) */}
                        <div>
                            <label htmlFor="salary" className="block text-sm font-medium mb-1">বেতন</label>
                            <input
                                type="number"
                                id="salary"
                                value={userData.salary || 0}
                                readOnly // এডিট করা যাবে না
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                            />
                        </div>
                        {/* ভূমিকা ফিল্ড - শুধুমাত্র দেখার জন্য (disabled) */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium mb-1">ভূমিকা</label>
                            <input
                                type="text"
                                id="role"
                                value={userData.role || 'Employee'}
                                readOnly // এডিট করা যাবে না
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                            />
                        </div>
                        {/* যাচাইকৃত স্ট্যাটাস ফিল্ড - শুধুমাত্র দেখার জন্য (disabled) */}
                        <div>
                            <label htmlFor="isVerified" className="block text-sm font-medium mb-1">যাচাইকৃত</label>
                            <input
                                type="text" // Boolean মানকে string হিসেবে দেখানোর জন্য text type
                                id="isVerified"
                                value={userData.isVerified ? 'হ্যাঁ' : 'না'}
                                readOnly // এডিট করা যাবে না
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                            />
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-4 mt-6">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md font-semibold hover:bg-gray-400 transition-colors shadow-md"
                            >
                                বাতিল করুন
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors shadow-md"
                                disabled={updateUserMutation.isLoading}
                            >
                                {updateUserMutation.isLoading ? 'আপডেট হচ্ছে...' : 'প্রোফাইল আপডেট করুন'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
