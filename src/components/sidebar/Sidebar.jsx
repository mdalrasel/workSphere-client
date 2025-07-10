import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';
import { FiHome, FiUser, FiLogOut } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router';

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
                    <li><Link to='/'>Home</Link></li>


                    {userRole === 'Employee' && (
                        <>
                            <li><Link to='/dashboard/employee-home'>Dashboard</Link></li>
                            <li><Link to='/dashboard/my-work-sheet'>My Work Sheet</Link></li>
                            <li><Link to='/dashboard/my-payment-history'>Payment History</Link></li>
                        </>
                    )}
                    {userRole === 'HR' && (
                        <>
                            <li><Link to=''>Dashboard</Link></li>
                            <li><Link to='/dashboard/employee-list'>Employee List</Link></li>
                            <li><Link to='/'>Progress</Link></li>
                        </>
                    )}
                    {userRole === 'Admin' && (
                        <>
                            <li><Link to='/'>Dashboard</Link></li>
                            <li><Link to='/'>All Employee List</Link></li>
                            <li><Link to='/'>Payroll</Link></li>
                        </>
                    )}
                </ul>
            </div>

            <div className="space-y-1 pt-4 border-t">
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
