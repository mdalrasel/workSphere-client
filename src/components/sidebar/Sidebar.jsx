import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';
import SidebarLink from './SidebarLink';
import { FiHome, FiUser, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router';

const Sidebar = () => {
    const { user, logOut } = useAuth();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();

    // Fetch user role from server
    const { data: userData, isLoading } = useQuery({
        queryKey: ['user-role', user?.email],
        enabled: !!user?.email,
        queryFn: async () => {
            const res = await axiosSecure.get(`/users?email=${user.email}`);
            return res.data;
        }
    });

    const userRole = userData?.role || 'Employee';

    const handleLogout = async () => {
        await logOut();
        navigate('/');
    };

    if (isLoading) return <p className="text-center">Loading Sidebar...</p>;

    return (
        <aside className="p-4 h-full flex flex-col justify-between">
            <div>
                <h2 className="text-xl font-bold mb-4">Dashboard</h2>
                <ul className="space-y-1">
                    <SidebarLink to="/" name="Home" icon={<FiHome />} />
                    <SidebarLink to="/dashboard" name="Dashboard Home" icon={<FiHome />} />

                    {userRole === 'Employee' && (
                        <>
                            <SidebarLink to="/dashboard/my-work-sheet" name="My Work Sheet" />
                            <SidebarLink to="/dashboard/payment-history" name="Payment History" />
                        </>
                    )}
                    {userRole === 'HR' && (
                        <>
                            <SidebarLink to="/dashboard/employee-list" name="Employee List" />
                            <SidebarLink to="/dashboard/progress" name="Progress" />
                        </>
                    )}
                    {userRole === 'Admin' && (
                        <>
                            <SidebarLink to="/dashboard/all-employee-list" name="All Employee List" />
                            <SidebarLink to="/dashboard/payroll" name="Payroll" />
                        </>
                    )}
                </ul>
            </div>

            <div className="space-y-1 pt-4 border-t">
                <SidebarLink to="/dashboard/profile" name="Profile" icon={<FiUser />} />
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-md text-red-500 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                >
                    <FiLogOut /> Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
