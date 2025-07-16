import  { useState, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ReusableTable from '../../utils/ReusableTable';
import ReusableCard from '../../components/cards/ReusableCard'; 
import Pagination from '../../utils/Pagination';
import LoadingSpinner from '../../utils/LoadingSpinner';
import { FaTable, FaThLarge } from 'react-icons/fa'; 

const MyWorkSheet = () => {
    const { user, loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingWork, setEditingWork] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const taskOptions = ["Sales", "Support", "Content", "Paper-work", "Meeting", "Research"];

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage =9;
    const [viewMode, setViewMode] = useState('table'); 

    const toggleViewMode = useCallback(() => {
        setViewMode((prevMode) => (prevMode === 'table' ? 'card' : 'table'));
    }, []);

    const { data: currentUserDetails, isLoading: isUserStatusLoading, error: userStatusError } = useQuery({
        queryKey: ['currentUserDetails', user?.email],
        enabled: !!user?.email && !authLoading,
        queryFn: async () => {
            const res = await axiosSecure.get(`/users/me?email=${user.email}`);
            return res.data;
        },
        refetchOnWindowFocus: true,
    });

    const isWorkSheetActive = currentUserDetails?.isActiveWorkSheet !== true;

    console.log("Current User Details:", currentUserDetails);
    console.log("Is Worksheet Active:", isWorkSheetActive);


    // 2. Fetch Worksheets for the current user (filtered by month/year)
    const { data: worksheets = [], isLoading: isWorksheetsLoading, error: worksheetsError } = useQuery({
        queryKey: ['my-work-sheets', user?.uid, selectedMonth, selectedYear],
        enabled: !!user?.uid && !authLoading,
        queryFn: async () => {
            const params = { uid: user.uid };
            if (selectedMonth) params.month = selectedMonth;
            if (selectedYear) params.year = selectedYear;

            const res = await axiosSecure.get('/worksheets', { params });
            return res.data;
        },
    });

    // 3. Mutation for submitting new work
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
            setCurrentPage(1);
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

    // 4. Mutation for deleting a work
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
            setCurrentPage(1);
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

    // 5. Mutation for updating a work
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

    const onSubmit = useCallback((data) => {
        if (!isWorkSheetActive) {
            Swal.fire({
                icon: "warning",
                title: "Submission Disabled",
                text: "Your worksheet submission is currently deactivated. Please contact your administrator.",
                confirmButtonColor: "#f4c721",
                background: '#fff',
                color: '#1f2937'
            });
            return;
        }

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
    }, [addWorkMutation, isWorkSheetActive, selectedDate, user]);

    const handleDelete = useCallback((id) => {
        if (!isWorkSheetActive) {
            Swal.fire({
                icon: "warning",
                title: "Action Disabled",
                text: "Your worksheet is currently deactivated. You cannot delete records.",
                confirmButtonColor: "#f4c721",
                background: '#fff',
                color: '#1f2937'
            });
            return;
        }

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
    }, [deleteWorkMutation, isWorkSheetActive]);

    const handleEdit = useCallback((work) => {
        if (!isWorkSheetActive) {
            Swal.fire({
                icon: "warning",
                title: "Action Disabled",
                text: "Your worksheet is currently deactivated. You cannot edit records.",
                confirmButtonColor: "#f4c721",
                background: '#fff',
                color: '#1f2937'
            });
            return;
        }

        setEditingWork(work);
        setValue('task', work.task);
        setValue('hours', work.hours);
        setSelectedDate(new Date(work.date));
        setIsEditModalOpen(true);
    }, [isWorkSheetActive, setValue]);

    // Update form submission handler
    const onUpdateSubmit = useCallback((data) => {
        if (!editingWork || !isWorkSheetActive) {
            Swal.fire({
                icon: "warning",
                title: "Update Disabled",
                text: "Your worksheet is currently deactivated. You cannot update records.",
                confirmButtonColor: "#f4c721",
                background: '#fff',
                color: '#1f2937'
            });
            return;
        }

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
    }, [editingWork, isWorkSheetActive, selectedDate, updateWorkMutation, user]);

    // Function to close modal
    const closeEditModal = useCallback(() => {
        setIsEditModalOpen(false);
        setEditingWork(null);
        reset();
        setSelectedDate(new Date());
    }, [reset]);

    const months = useMemo(() => [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ], []);

    const currentYear = new Date().getFullYear();
    const years = useMemo(() => Array.from({ length: 5 }, (_, i) => currentYear - i), [currentYear]);

    // Filter and sort worksheets data for the table
    const filteredWorksheets = useMemo(() => {
        let filtered = worksheets;


        if (selectedMonth) {
            filtered = filtered.filter(work => work.month === selectedMonth);
        }
        if (selectedYear) {
            filtered = filtered.filter(work => work.year === parseInt(selectedYear));
        }

        return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [worksheets, selectedMonth, selectedYear]);

    const totalPages = Math.ceil(filteredWorksheets.length / itemsPerPage);

    // Get current items for the table
    const currentWorksheets = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredWorksheets.slice(startIndex, endIndex);
    }, [filteredWorksheets, currentPage, itemsPerPage]);

    // Handle page change for pagination
    const handlePageChange = useCallback((pageNumber) => {
        setCurrentPage(pageNumber);
    }, []);

    // Define columns for ReusableTable
    const myWorkSheetColumns = useMemo(() => [
        {
            header: 'Date',
            key: 'date',
            headerClassName: 'text-left',
            dataClassName: 'font-medium text-gray-900 dark:text-white',
            render: (work) => new Date(work.date).toLocaleDateString(),
        },
        {
            header: 'Task Description',
            key: 'task',
            headerClassName: 'text-left',
            dataClassName: 'text-gray-700 dark:text-gray-300',
        },
        {
            header: 'Hours',
            key: 'hours',
            headerClassName: 'text-left',
            dataClassName: 'text-gray-700 dark:text-gray-300',
        },
        {
            header: 'Submission Date',
            key: 'submissionDate',
            headerClassName: 'text-left',
            dataClassName: 'text-gray-700 dark:text-gray-300',
            render: (work) => new Date(work.submissionDate).toLocaleDateString(),
        },
        {
            header: 'Actions',
            key: 'actions',
            headerClassName: 'text-left',
            dataClassName: 'whitespace-nowrap text-sm font-medium',
            render: (work) => (
                <>
                    <button
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 mr-3"
                        onClick={() => handleEdit(work)}
                        disabled={!isWorkSheetActive}
                    >
                        Edit 🖊
                    </button>
                    <button
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                        onClick={() => handleDelete(work._id)}
                        disabled={!isWorkSheetActive}
                    >
                        Delete ❌
                    </button>
                </>
            ),
        },
    ], [handleEdit, handleDelete, isWorkSheetActive]);

    // renderItem function for ReusableCard
    const renderWorksheetCard = useCallback((workItem) => (
        <div className="flex flex-col space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Task: {workItem.task}
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Date:</span> {new Date(workItem.date).toLocaleDateString()}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Hours:</span> {workItem.hours}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Submitted On:</span> {new Date(workItem.submissionDate).toLocaleDateString()}
            </p>
            <div className="flex justify-end gap-2 mt-4">
                <button
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200"
                    onClick={() => handleEdit(workItem)}
                    disabled={!isWorkSheetActive}
                >
                    Edit 🖊
                </button>
                <button
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                    onClick={() => handleDelete(workItem._id)}
                    disabled={!isWorkSheetActive}
                >
                    Delete ❌
                </button>
            </div>
        </div>
    ), [handleEdit, handleDelete, isWorkSheetActive]);


    if (authLoading || isUserStatusLoading || !user?.uid) {
        return <LoadingSpinner />;
    }

    if (userStatusError) {
        return (
            <div className="text-red-500 text-center py-10">
                <p>Failed to load user status: {userStatusError.message}</p>
            </div>
        );
    }


    if (!isWorkSheetActive) {
        return (
            <div className="text-center py-10 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 rounded relative mx-auto my-10 max-w-xl" role="alert">
                <h3 className="font-bold text-xl mb-2">Worksheet Deactivated!</h3>
                <p className="text-lg">Your worksheet access has been temporarily deactivated by an administrator. You cannot submit, edit, or view your work records at this time.</p>
                <p className="mt-4">Please contact your HR or administrator for more information.</p>
            </div>
        );
    }

    if (isWorksheetsLoading) {
        return <LoadingSpinner />;
    }

    if (worksheetsError) {
        return (
            <div className="text-red-500 text-center py-10">
                <p>Failed to load work records: {worksheetsError.message}</p>
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
                            disabled={!isWorkSheetActive}
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
                            disabled={!isWorkSheetActive}
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
                            disabled={!isWorkSheetActive}
                        />
                        {errors.hours && <p className="text-red-500 text-sm mt-1">{errors.hours.message}</p>}
                    </div>
                    <div className="md:col-span-3 flex justify-center mt-4">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors shadow-md"
                            disabled={addWorkMutation.isLoading || !isWorkSheetActive}
                        >
                            {addWorkMutation.isLoading ? 'Submitting...' : 'Submit Work'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="mb-6 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                <h3 className="text-2xl font-semibold mb-4">My Work History</h3>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <label htmlFor="monthFilter" className="block text-sm font-medium mb-1">Filter by Month</label>
                        <select
                            id="monthFilter"
                            value={selectedMonth}
                            onChange={(e) => {
                                setSelectedMonth(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                            disabled={!isWorkSheetActive}
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
                            onChange={(e) => {
                                setSelectedYear(e.target.value);
                                setCurrentPage(1); // Reset page on filter change
                            }}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                            disabled={!isWorkSheetActive}
                        >
                            <option value="">All Years</option>
                            {years.map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:w-auto flex items-end">
                        <button
                            onClick={toggleViewMode}
                            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 shadow-md w-full justify-center md:w-auto"
                            disabled={!isWorkSheetActive}
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
                </div>

                {filteredWorksheets.length === 0 ? (
                    <p className="text-center text-gray-600 dark:text-gray-400">No work records found for the selected filters.</p>
                ) : (
                    <>
                        {viewMode === 'table' ? (
                            <ReusableTable
                                columns={myWorkSheetColumns}
                                data={currentWorksheets} // Use paginated data
                                rowKey="_id"
                                renderEmpty={<p className="text-center text-gray-600 dark:text-gray-400">No work records found for this page.</p>}
                            />
                        ) : (
                            <ReusableCard
                                data={currentWorksheets}
                                rowKey="_id"
                                renderItem={renderWorksheetCard}
                            />
                        )}

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            itemsPerPage={itemsPerPage}
                            totalItems={filteredWorksheets.length}
                        />
                    </>
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
                            &times;
                        </button>
                        <form onSubmit={handleSubmit(onUpdateSubmit)} className="grid grid-cols-1 gap-4">

                            <div>
                                <label htmlFor="editTask" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Task Description</label>
                                <select
                                    id="editTask"
                                    {...register('task', { required: "Task description is required" })}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                    disabled={!isWorkSheetActive}
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
                                    disabled={!isWorkSheetActive}
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
                                    disabled={!isWorkSheetActive}
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
                                    disabled={updateWorkMutation.isLoading || !isWorkSheetActive}
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