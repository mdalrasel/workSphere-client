// src/pages/dashboard/MyWorkSheet.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';

// React DatePicker এর জন্য ইম্পোর্ট
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // DatePicker এর CSS ইম্পোর্ট করুন

const MyWorkSheet = () => {
    const { user, loading } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset,  formState: { errors } } = useForm();
    
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');

    const taskOptions = ["Sales", "Support", "Content", "Paper-work", "Meeting", "Research"];

    // 1. Fetch Worksheets for the current user (filtered by month/year)
    const { data: worksheets = [], isLoading: isWorksheetsLoading, error: worksheetsError } = useQuery({
        queryKey: ['my-work-sheets', user?.uid, selectedMonth, selectedYear],
        enabled: !!user?.uid && !loading,
        queryFn: async () => {
            const params = { uid: user.uid };
            if (selectedMonth) params.month = selectedMonth;
            if (selectedYear) params.year = selectedYear;

            const res = await axiosSecure.get('/worksheets', { params });
            return res.data;
        },
    });

    // 2. Mutation for submitting new work
    const addWorkMutation = useMutation({
        mutationFn: async (newWorkData) => {
            const res = await axiosSecure.post('/worksheets', newWorkData);
            return res.data;
        },
        onSuccess: () => {
            Swal.fire({
                icon: "success",
                title: "কাজ সফলভাবে জমা হয়েছে!",
                showConfirmButton: false,
                timer: 1500,
                background: '#fff',
                color: '#1f2937'
            });
            reset();
            setSelectedDate(new Date());
            queryClient.invalidateQueries(['my-work-sheets', user?.uid, selectedMonth, selectedYear]);
        },
        onError: (error) => {
            console.error("কাজ জমা দিতে ব্যর্থ:", error);
            Swal.fire({
                icon: "error",
                title: "কাজ জমা দিতে ব্যর্থ",
                text: error.response?.data?.message || "কিছু ভুল হয়েছে।",
                confirmButtonColor: "#d33",
                background: '#fff',
                color: '#1f2937'
            });
        },
    });

    // 3. Mutation for deleting a work
    const deleteWorkMutation = useMutation({
        mutationFn: async (id) => {
            const res = await axiosSecure.delete(`/worksheets/${id}`);
            return res.data;
        },
        onSuccess: () => {
            Swal.fire({
                icon: "success",
                title: "কাজ সফলভাবে মুছে ফেলা হয়েছে!",
                showConfirmButton: false,
                timer: 1500,
                background: '#fff',
                color: '#1f2937'
            });
            // ডেটা রি-ফেচ করার জন্য invalidateQueries
            queryClient.invalidateQueries(['my-work-sheets', user?.uid, selectedMonth, selectedYear]);
        },
        onError: (error) => {
            console.error("কাজ মুছতে ব্যর্থ:", error);
            Swal.fire({
                icon: "error",
                title: "কাজ মুছতে ব্যর্থ",
                text: error.response?.data?.message || "কিছু ভুল হয়েছে।",
                confirmButtonColor: "#d33",
                background: '#fff',
                color: '#1f2937'
            });
        },
    });

    const onSubmit = (data) => {
        if (loading) return;

        const workDate = selectedDate;
        const month = workDate.toLocaleString('default', { month: 'long' });
        const year = workDate.getFullYear();

        const newWork = {
            email: user.email,
            uid: user.uid,
            date: workDate.toISOString().split('T')[0],
            task: data.task,
            hours: parseFloat(data.hours),
            month: month,
            year: year,
            submissionDate: new Date().toISOString(),
        };
        addWorkMutation.mutate(newWork);
    };

    // Delete handler
    const handleDelete = (id) => {
        Swal.fire({
            title: "আপনি কি নিশ্চিত?",
            text: "আপনি এই কাজের রেকর্ডটি মুছে ফেলতে চান?",
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
                deleteWorkMutation.mutate(id);
            }
        });
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    if (loading || isWorksheetsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
            </div>
        );
    }

    if (worksheetsError) {
        return (
            <div className="text-red-500 text-center py-10">
                <p>ডেটা লোড করতে সমস্যা হয়েছে: {worksheetsError.message}</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-900 dark:text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">আমার ওয়ার্কশিট</h2>

            {/* Work Submission Form */}
            <div className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                <h3 className="text-2xl font-semibold mb-4">নতুন কাজ জমা দিন</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Tasks Dropdown */}
                    <div>
                        <label htmlFor="task" className="block text-sm font-medium mb-1">কাজের বিবরণ</label>
                        <select
                            id="task"
                            {...register('task', { required: "কাজের বিবরণ আবশ্যক" })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">একটি কাজ নির্বাচন করুন</option>
                            {taskOptions.map((task) => (
                                <option key={task} value={task}>{task}</option>
                            ))}
                        </select>
                        {errors.task && <p className="text-red-500 text-sm mt-1">{errors.task.message}</p>}
                    </div>
                    {/* DatePicker */}
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium mb-1">তারিখ</label>
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            dateFormat="yyyy/MM/dd"
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                            placeholderText="তারিখ নির্বাচন করুন"
                        />
                        {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
                    </div>
                    {/* Hours Worked */}
                    <div>
                        <label htmlFor="hours" className="block text-sm font-medium mb-1">ঘন্টা</label>
                        <input
                            type="number"
                            id="hours"
                            step="0.5"
                            {...register('hours', {
                                required: "ঘন্টা আবশ্যক",
                                min: { value: 0.5, message: "কমপক্ষে 0.5 ঘন্টা হতে হবে" },
                                max: { value: 24, message: "সর্বোচ্চ 24 ঘন্টা হতে হবে" }
                            })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                            placeholder="যেমন: 8.0"
                        />
                        {errors.hours && <p className="text-red-500 text-sm mt-1">{errors.hours.message}</p>}
                    </div>
                    <div className="md:col-span-3 flex justify-center mt-4">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors shadow-md"
                            disabled={addWorkMutation.isLoading}
                        >
                            {addWorkMutation.isLoading ? 'জমা হচ্ছে...' : 'কাজ জমা দিন'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Work History Table */}
            <div className="mb-6 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                <h3 className="text-2xl font-semibold mb-4">আমার কাজের ইতিহাস</h3>

                {/* Filter Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <label htmlFor="monthFilter" className="block text-sm font-medium mb-1">মাস দ্বারা ফিল্টার করুন</label>
                        <select
                            id="monthFilter"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">সকল মাস</option>
                            {months.map((month) => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label htmlFor="yearFilter" className="block text-sm font-medium mb-1">বছর দ্বারা ফিল্টার করুন</label>
                        <select
                            id="yearFilter"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">সকল বছর</option>
                            {years.map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {worksheets.length === 0 ? (
                    <p className="text-center text-gray-600 dark:text-gray-400">কোনো কাজের রেকর্ড পাওয়া যায়নি।</p>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        তারিখ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        কাজের বিবরণ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        ঘন্টা
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        জমা দেওয়ার তারিখ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        অ্যাকশন
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {worksheets.map((work) => (
                                    <tr key={work._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {new Date(work.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                            {work.task}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                            {work.hours}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                            {new Date(work.submissionDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 mr-3"
                                                // onClick={() => handleEdit(work)} // পরবর্তী ধাপে যোগ করা হবে
                                            >
                                                এডিট 🖊
                                            </button>
                                            <button 
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                                                onClick={() => handleDelete(work._id)} // handleDelete ফাংশন কল করা হয়েছে
                                            >
                                                ডিলিট ❌
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyWorkSheet;
