import { FiLogOut } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router';
import WorkSphereLogo from '../../utils/WorkSphereLogo';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { useQuery } from '@tanstack/react-query';

const Sidebar = () => {
  const { user, logOut } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  // Query user role from server
  const { data: userData, isLoading } = useQuery({
    queryKey: ['user-role', user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const res = await axiosSecure.get(`/users?email=${user.email}`);
      return res.data;
    },
  });

  const userRole = userData?.role || 'Employee';

  const handleLogout = async () => {
    await logOut();
    navigate('/signIn');
  };

  if (isLoading) return <p className="text-center py-4">Loading Sidebar...</p>;

  return (
    <aside className="p-4 h-full flex flex-col justify-between bg-gray-800 text-white">
      {/* Logo */}
      <div>
        <Link to="/" className="flex items-center gap-2 mb-6 text-xl font-bold">
          <WorkSphereLogo />
        </Link>

        {/* Navigation */}
        <ul className="space-y-1">
          {userRole === 'Employee' && (
            <>
              <li><SidebarLink to="/dashboard/employee-home" label="Dashboard" /></li>
              <li><SidebarLink to="/dashboard/my-work-sheet" label="Work Sheet" /></li>
              <li><SidebarLink to="/dashboard/my-payment-history" label="Payment History" /></li>
            </>
          )}

          {userRole === 'HR' && (
            <>
              <li><SidebarLink to="/dashboard/hr-home" label="Dashboard" /></li>
              <li><SidebarLink to="/dashboard/employee-list" label="Employee List" /></li>
              <li><SidebarLink to="/dashboard/progress" label="Progress" /></li>
              <li><SidebarLink to="/dashboard/payment-history" label="Payment History" /></li>
            </>
          )}

          {userRole === 'Admin' && (
            <>
              <li><SidebarLink to="/dashboard/admin-home" label="Dashboard" /></li>
              <li><SidebarLink to="/dashboard/manage-users" label="Manage Users" /></li>
              <li><SidebarLink to="/dashboard/all-employee-list" label="Employee List" /></li>
              <li><SidebarLink to="/dashboard/payroll" label="Payroll" /></li>
            </>
          )}
        </ul>
      </div>

      {/* Bottom Section */}
      <div className="pt-4 border-t border-gray-600 space-y-2">
        <SidebarLink to="/dashboard/profile" label="Profile" />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-md text-red-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-800 transition-colors duration-200"
        >
          <FiLogOut /> Logout
        </button>
      </div>
    </aside>
  );
};

// ✅ Reusable Sidebar Link Component
const SidebarLink = ({ to, label }) => (
  <Link
    to={to}
    className="block px-4 py-2 rounded-md hover:bg-blue-200 hover:text-blue-900 dark:hover:bg-blue-700 dark:hover:text-white transition-all duration-200"
  >
    {label}
  </Link>
);

export default Sidebar;
