// src/pages/dashboard/Progress.jsx

import React, { useMemo } from 'react'; 
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { useForm } from 'react-hook-form';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import LoadingSpinner from '../../utils/LoadingSpinner';

const Progress = () => {
   const { loading: authLoading, user } = useAuth(); 
    const axiosSecure = useAxiosSecure();
    const { register, watch } = useForm();

    // Watch form fields for filtering
    const employeeUidFilter = watch('employeeUid', '');
    const monthFilter = watch('month', '');
    const yearFilter = watch('year', '');
    const taskFilter = watch('task', '');

    // 1. Fetch all users (for employee name lookup)
    const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery({
        queryKey: ['all-users-for-progress'],
        enabled: !authLoading, // Ensure query is enabled only when auth is not loading
        queryFn: async () => {
            const res = await axiosSecure.get('/users');
            return res.data;
        },
    });

    // Create a map for quick employee name lookup by UID
    const employeeMap = useMemo(() => {
        return users.reduce((acc, user) => {
            if (user.uid) {
                acc[user.uid] = user.name;
            }
            return acc;
        }, {});
    }, [users]); 

    // 2. Fetch all worksheets with filters
    const { data: worksheets = [], isLoading: worksheetsLoading, error: worksheetsError } = useQuery({
        queryKey: ['all-worksheets', employeeUidFilter, monthFilter, yearFilter, taskFilter],
        enabled: !authLoading, // Ensure query is enabled only when auth is not loading
        queryFn: async () => {
            const params = new URLSearchParams();
            if (employeeUidFilter) params.append('employeeUid', employeeUidFilter);
            if (monthFilter) params.append('month', monthFilter);
            if (yearFilter) params.append('year', yearFilter);
            if (taskFilter) params.append('task', taskFilter);

            const res = await axiosSecure.get(`/all-worksheets?${params.toString()}`);
            return res.data;
        },
    });

    // Prepare chart data: Aggregate hours worked per employee
    const chartData = useMemo(() => {
        const employeeHours = {};
        worksheets.forEach(ws => {
            const employeeName = employeeMap[ws.uid] || 'Unknown Employee';
            if (!employeeHours[employeeName]) {
                employeeHours[employeeName] = 0;
            }
            employeeHours[employeeName] += ws.hours;
        });

        // Convert to array of objects for Recharts
        return Object.keys(employeeHours).map(name => ({
            name: name,
            'Total Hours': employeeHours[name]
        }));
    }, [worksheets, employeeMap]); 
    const months = [
        "", "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const currentYear = new Date().getFullYear();
    const years = ["", ...Array.from({ length: 5 }, (_, i) => currentYear - i)]; 

    if (authLoading || usersLoading || worksheetsLoading || !user) {
    return (
        <LoadingSpinner />
    );
}

    if (usersError || worksheetsError) {
        return (
            <div className="text-red-500 text-center py-10">
                <p>Failed to load work progress: {usersError?.message || worksheetsError?.message}</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-900 dark:text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">Employee Work Progress</h2>

            {/* Filter Section */}
            <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div>
                    <label htmlFor="employeeUid" className="block text-sm font-medium mb-1">Employee</label>
                    <select
                        id="employeeUid"
                        {...register('employeeUid')}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">All Employees</option>
                        {users.filter(u => u.role === 'Employee' && u.uid).map(employee => (
                            <option key={employee.uid} value={employee.uid}>{employee.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="month" className="block text-sm font-medium mb-1">Month</label>
                    <select
                        id="month"
                        {...register('month')}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    >
                        {months.map((month) => (
                            <option key={month} value={month}>{month === "" ? "All Months" : month}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="year" className="block text-sm font-medium mb-1">Year</label>
                    <select
                        id="year"
                        {...register('year')}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    >
                        {years.map((year) => (
                            <option key={year} value={year}>{year === "" ? "All Years" : year}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="task" className="block text-sm font-medium mb-1">Task</label>
                    <input
                        type="text"
                        id="task"
                        {...register('task')}
                        placeholder="Search task description"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </form>

            {chartData.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400">No work progress found for the selected filters.</p>
            ) : (
                <div className="mt-8 bg-gray-100 dark:bg-gray-700 p-6 rounded-lg shadow-lg">
                    <h3 className="text-2xl font-semibold mb-4 text-center text-gray-900 dark:text-white">Total Hours Worked by Employee</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 20, right: 30, left: 20, bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-gray-600"/>
                            <XAxis dataKey="name" stroke="#6b7280" className="dark:stroke-gray-300 text-sm" />
                            <YAxis stroke="#6b7280" className="dark:stroke-gray-300 text-sm" label={{ value: 'Hours Worked', angle: -90, position: 'insideLeft', fill: '#6b7280', className: 'dark:fill-gray-300' }} />
                            <Tooltip 
                                cursor={{ fill: 'rgba(0,0,0,0.1)' }} 
                                contentStyle={{ backgroundColor: '#374151', borderColor: '#4b5563', color: '#ffffff', borderRadius: '8px' }} 
                                labelStyle={{ color: '#9ca3af' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px', color: '#6b7280' }} className="dark:text-gray-300" />
                            <Bar 
                                dataKey="Total Hours" 
                                fill="#8884d8" 
                                radius={[10, 10, 0, 0]} 
                            >
                                {
                                    chartData.map((entry, index) => (
                                        <Bar
                                            key={`bar-${index}`}
                                            fill={
                                                index % 5 === 0 ? '#4CAF50' : // Green
                                                index % 5 === 1 ? '#2196F3' : // Blue
                                                index % 5 === 2 ? '#FFC107' : // Amber
                                                index % 5 === 3 ? '#9C27B0' : // Purple
                                                '#FF5722' // Deep Orange
                                            }
                                        />
                                    ))
                                }
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default Progress;
