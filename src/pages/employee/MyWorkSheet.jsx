import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; 
import LoadingSpinner from '../../utils/LoadingSpinner';

const MyWorkSheet = () => {
    const { user, loading } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
    const [selectedDate, setSelectedDate] = useState(new Date()); 
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingWork, setEditingWork] = useState(null); 
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
                title: "Work submitted successfully!",
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
            Swal.fire({
                icon: "error",
                title: "Work Submission Failed",
                text: error.response?.data?.message || "Something went wrong.",
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
                title: "Work successfully deleted!",
                showConfirmButton: false,
                timer: 1500,
                background: '#fff',
                color: '#1f2937'
            });
            queryClient.invalidateQueries(['my-work-sheets', user?.uid, selectedMonth, selectedYear]);
        },
        onError: (error) => {
            Swal.fire({
                icon: "error",
                title: "Work Deletion Failed",
                text: error.response?.data?.message || "Something went wrong.",
                confirmButtonColor: "#d33",
                background: '#fff',
                color: '#1f2937'
            });
        },
    });

    // 4. Mutation for updating a work
    const updateWorkMutation = useMutation({
        mutationFn: async (updatedWorkData) => {
            const res = await axiosSecure.put(`/worksheets/${updatedWorkData._id}`, updatedWorkData);
            return res.data;
        },
        onSuccess: () => {
            Swal.fire({
                icon: "success",
                title: "Work updated successfully!",
                showConfirmButton: false,
                timer: 1500,
                background: '#fff',
                color: '#1f2937'
            });
            closeEditModal();
            queryClient.invalidateQueries(['my-work-sheets', user?.uid, selectedMonth, selectedYear]);
        },
        onError: (error) => {
            Swal.fire({
                icon: "error",
                title: "Work Update Failed",
                text: error.response?.data?.message || "Something went wrong.",
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
            title: "Are you sure?",
            text: "Do you want to delete this work record?",
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
                deleteWorkMutation.mutate(id);
            }
        });
    };

    // Edit handler - Opens modal and sets form values
    const handleEdit = (work) => {
        setEditingWork(work);
        setValue('task', work.task);
        setValue('hours', work.hours);
        setSelectedDate(new Date(work.date)); 
        setIsEditModalOpen(true);
    };

    // Update form submission handler
    const onUpdateSubmit = (data) => {
        if (!editingWork) return; 

        const updatedWork = {
            _id: editingWork._id, 
            email: user.email,
            uid: user.uid,
            date: selectedDate.toISOString().split('T')[0], 
            task: data.task,
            hours: parseFloat(data.hours),
            month: selectedDate.toLocaleString('default', { month: 'long' }),
            year: selectedDate.getFullYear(),
        };
        updateWorkMutation.mutate(updatedWork); 
    };

    // Function to close modal
    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingWork(null);
        reset(); 
        setSelectedDate(new Date()); 
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i); // Last 5 years

    if (loading || isWorksheetsLoading) {
        return (
            <LoadingSpinner />
        );
    }

    if (worksheetsError) {
        return (
            <div className="text-red-500 text-center py-10">
                <p>Failed to load data: {worksheetsError.message}</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-900 dark:text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">My Worksheets</h2>

            {/* Work Submission Form */}
            <div className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                <h3 className="text-2xl font-semibold mb-4">Submit New Work</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Tasks Dropdown */}
                    <div>
                        <label htmlFor="task" className="block text-sm font-medium mb-1">Task Description</label>
                        <select
                            id="task"
                            {...register('task', { required: "Task description is required" })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select a task</option>
                            {taskOptions.map((task) => (
                                <option key={task} value={task}>{task}</option>
                            ))}
                        </select>
                        {errors.task && <p className="text-red-500 text-sm mt-1">{errors.task.message}</p>}
                    </div>
                    {/* DatePicker */}
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium mb-1">Date</label>
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            dateFormat="yyyy/MM/dd"
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                            placeholderText="Select a date"
                        />
                        {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
                    </div>
                    {/* Hours Worked */}
                    <div>
                        <label htmlFor="hours" className="block text-sm font-medium mb-1">Hours</label>
                        <input
                            type="number"
                            id="hours"
                            step="0.5"
                            {...register('hours', {
                                required: "Hours are required",
                                min: { value: 0.5, message: "Must be at least 0.5 hours" },
                                max: { value: 24, message: "Must be at most 24 hours" }
                            })}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., 8.0"
                        />
                        {errors.hours && <p className="text-red-500 text-sm mt-1">{errors.hours.message}</p>}
                    </div>
                    <div className="md:col-span-3 flex justify-center mt-4">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors shadow-md"
                            disabled={addWorkMutation.isLoading}
                        >
                            {addWorkMutation.isLoading ? 'Submitting...' : 'Submit Work'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Work History Table */}
            <div className="mb-6 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                <h3 className="text-2xl font-semibold mb-4">My Work History</h3>

                {/* Filter Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <label htmlFor="monthFilter" className="block text-sm font-medium mb-1">Filter by Month</label>
                        <select
                            id="monthFilter"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Months</option>
                            {months.map((month) => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label htmlFor="yearFilter" className="block text-sm font-medium mb-1">Filter by Year</label>
                        <select
                            id="yearFilter"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Years</option>
                            {years.map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {worksheets.length === 0 ? (
                    <p className="text-center text-gray-600 dark:text-gray-400">No work records found.</p>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Task Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Hours
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Submission Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
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
                                                onClick={() => handleEdit(work)}
                                            >
                                                Edit 🖊
                                            </button>
                                            <button 
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                                                onClick={() => handleDelete(work._id)}
                                            >
                                                Delete ❌
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Work Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
                        <h3 className="text-2xl font-semibold mb-6 text-center text-gray-900 dark:text-white">Edit Work</h3>
                        <button
                            onClick={closeEditModal}
                            className="absolute top-4 right-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl"
                        >
                            &times; {/* Close button icon */}
                        </button>
                        <form onSubmit={handleSubmit(onUpdateSubmit)} className="grid grid-cols-1 gap-4">
                            {/* Tasks Dropdown for Edit */}
                            <div>
                                <label htmlFor="editTask" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Task Description</label>
                                <select
                                    id="editTask"
                                    {...register('task', { required: "Task description is required" })}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select a task</option>
                                    {taskOptions.map((task) => (
                                        <option key={task} value={task}>{task}</option>
                                    ))}
                                </select>
                                {errors.task && <p className="text-red-500 text-sm mt-1">{errors.task.message}</p>}
                            </div>
                            {/* DatePicker for Edit */}
                            <div>
                                <label htmlFor="editDate" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Date</label>
                                <DatePicker
                                    selected={selectedDate}
                                    onChange={(date) => setSelectedDate(date)}
                                    dateFormat="yyyy/MM/dd"
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                    placeholderText="Select a date"
                                />
                                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
                            </div>
                            {/* Hours Worked for Edit */}
                            <div>
                                <label htmlFor="editHours" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Hours</label>
                                <input
                                    type="number"
                                    id="editHours"
                                    step="0.5"
                                    {...register('hours', {
                                        required: "Hours are required",
                                        min: { value: 0.5, message: "Must be at least 0.5 hours" },
                                        max: { value: 24, message: "Must be at most 24 hours" }
                                    })}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., 8.0"
                                />
                                {errors.hours && <p className="text-red-500 text-sm mt-1">{errors.hours.message}</p>}
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md font-semibold hover:bg-gray-400 transition-colors shadow-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors shadow-md"
                                    disabled={updateWorkMutation.isLoading}
                                >
                                    {updateWorkMutation.isLoading ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyWorkSheet;
