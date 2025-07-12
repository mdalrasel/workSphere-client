import { useQuery } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { useForm } from 'react-hook-form';

const PaymentHistoryHR = () => {
  const { loading: authLoading } = useAuth();
  const axiosSecure = useAxiosSecure();
  const { register, watch } = useForm();

  const employeeUidFilter = watch('employeeUid', '');
  const monthFilter = watch('month', '');
  const yearFilter = watch('year', '');

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['all-users'],
    enabled: !authLoading,
    queryFn: async () => {
      const res = await axiosSecure.get('/users');
      return res.data;
    }
  });

  // Fetch all payments and filter on client side
  const { data: allPayments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['all-payments'],
    enabled: !authLoading,
    queryFn: async () => {
      const res = await axiosSecure.get('/all-payments');
      return res.data;
    }
  });

  // Client-side filtering
  const filteredPayments = allPayments.filter(payment => {
    const matchUid = employeeUidFilter ? payment.employeeUid === employeeUidFilter : true;
    const matchMonth = monthFilter ? payment.month === monthFilter : true;
    const matchYear = yearFilter ? payment.year.toString() === yearFilter.toString() : true;
    return matchUid && matchMonth && matchYear;
  });

  // Options for filters
  const months = [
    "", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const currentYear = new Date().getFullYear();
  const years = ["", ...Array.from({ length: 5 }, (_, i) => currentYear - i)];

  if (authLoading || usersLoading || paymentsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <span className="loading loading-spinner loading-lg text-blue-600"></span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow text-gray-900 dark:text-white">
      <h2 className="text-3xl font-bold mb-6 text-center">All Employee Payment History</h2>

      {/* Filters */}
      <form className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
        <div>
          <label htmlFor="employeeUid" className="block text-sm font-medium mb-1">Employee</label>
          <select
            id="employeeUid"
            {...register('employeeUid')}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            <option value="">All Employees</option>
            {users.filter(u => u.role === 'Employee' && u.uid).map(user => (
              <option key={user.uid} value={user.uid}>{user.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="month" className="block text-sm font-medium mb-1">Month</label>
          <select
            id="month"
            {...register('month')}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            {months.map(month => (
              <option key={month} value={month}>{month || "All Months"}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="year" className="block text-sm font-medium mb-1">Year</label>
          <select
            id="year"
            {...register('year')}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            {years.map(year => (
              <option key={year} value={year}>{year || "All Years"}</option>
            ))}
          </select>
        </div>
      </form>

      {/* Data Table */}
      {filteredPayments.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400">No payment history found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Employee Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase">Transaction ID</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPayments.map(payment => (
                <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {payment.employeeName || 'Unknown Employee'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{payment.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{payment.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">${payment.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{payment.transactionId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentHistoryHR;
