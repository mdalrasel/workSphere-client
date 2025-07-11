import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';
import { FiLogOut } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router';
import WorkSphereLogo from '../../utils/WorkSphereLogo';

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
        navigate('/signIn');
    };

    if (isLoading) return <p className="text-center">Loading Sidebar...</p>;

    return (
        <aside className="p-4 h-full flex flex-col justify-between ">
            <div>
                <h2 className="text-xl font-bold mb-4"><Link to='/' className="flex items-center"><WorkSphereLogo /></Link></h2>
                <ul className="space-y-3 ">
                    {userRole === 'Employee' && (
                        <>
                            <li><Link to='/dashboard/employee-home'>Dashboard</Link></li>
                            <li><Link to='/dashboard/my-work-sheet'>Work Sheet</Link></li>
                            <li><Link to='/dashboard/my-payment-history'>Payment History</Link></li>
                        </>
                    )}
                    {userRole === 'HR' && (
                        <>
                            <li><Link to='/dashboard/hr-home'>Dashboard</Link></li>
                            <li><Link to='/dashboard/employee-list'>Employee List</Link></li>
                            <li><Link to='/dashboard/progress'>Progress</Link></li>
                            <li><Link to='/dashboard/payment-history'>Payment History</Link></li>
                        </>
                    )}
                    {userRole === 'Admin' && (
                        <>
                            <li><Link to='/dashboard/admin-home'>Dashboad</Link></li>
                            <li><Link to='/dashboard/manage-users'>Manage User</Link></li>
                            <li><Link to='/dashboard/all-employee-list'>Employee List</Link></li>
                            <li><Link to='/dashboard/payroll'>Payroll</Link></li>
                        </>
                    )}
                </ul>
            </div>

            <div className="space-y-1 pt-4 pb-20 border-t">
                <li><Link to='/dashboard/profile'>Profile</Link></li>
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
