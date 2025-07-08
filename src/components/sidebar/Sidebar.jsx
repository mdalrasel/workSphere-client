import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router'; 
import {
    FaBars, FaTimes, FaHome, FaUser, FaSignOutAlt, FaUsers, FaTasks,
    FaHistory, FaUserTie, FaChartLine, FaClipboardList, FaUserCog, FaDollarSign
} from 'react-icons/fa'; 
import useAuth from '../../hooks/useAuth';
import WorkSphereLogo from '../../utils/WorkSphereLogo';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logOut } = useAuth(); // Auth context থেকে user এবং logOut নিন
    const navigate = useNavigate(); // useNavigate হুক ব্যবহার করুন

    // ব্যবহারকারীর ভূমিকা নির্ধারণ
    // user.role প্রপার্টি ব্যবহার করুন, যদি না থাকে তবে ডিফল্ট 'Employee'
    const userRole = user?.role || 'Employee';

    // ড্যাশবোর্ড নেভিগেশন লিংকগুলো ব্যবহারকারীর ভূমিকা অনুযায়ী
    const getDashboardLinks = (role) => {
        const commonLinks = [
            { name: 'My Profile', path: '/dashboard/profile', icon: <FaUser /> },
        ];

        const employeeLinks = [
            { name: 'Employee Home', path: '/dashboard/employee-home', icon: <FaHome /> },
            { name: 'My Work Sheet', path: '/dashboard/my-work-sheet', icon: <FaTasks /> },
            { name: 'My Payment History', path: '/dashboard/my-payment-history', icon: <FaHistory /> },
        ];

        const hrLinks = [
            { name: 'HR Home', path: '/dashboard/hr-home', icon: <FaUserTie /> },
            { name: 'Employee List', path: '/dashboard/employee-list', icon: <FaUsers /> },
            { name: 'Payment History', path: '/dashboard/payment-history', icon: <FaDollarSign /> },
            { name: 'Progress', path: '/dashboard/progress', icon: <FaChartLine /> },
        ];

        const adminLinks = [
            { name: 'Admin Home', path: '/dashboard/admin-home', icon: <FaUserCog /> },
            { name: 'Manage Users', path: '/dashboard/manage-users', icon: <FaUsers /> },
            { name: 'All Employee List', path: '/dashboard/all-employee-list', icon: <FaClipboardList /> },
            { name: 'Payroll', path: '/dashboard/payroll', icon: <FaDollarSign /> }, // রিকোয়ারমেন্ট অনুযায়ী Payroll
        ];

        switch (role) {
            case 'Employee':
                return [...employeeLinks, ...commonLinks];
            case 'HR':
                return [...hrLinks, ...commonLinks];
            case 'Admin':
                return [...adminLinks, ...commonLinks];
            default:
                return commonLinks; // যদি কোনো রোল না থাকে
        }
    };

    const dashboardLinks = getDashboardLinks(userRole);

    const handleLogout = () => {
        logOut()
            .then(() => {
                console.log("Logged out from dashboard");
                navigate('/'); // লগআউটের পর ইউজারকে হোম পেজে রিডাইরেক্ট করুন
            })
            .catch(err => {
                console.error("Logout error:", err);
                // এখানে SweetAlert ব্যবহার করে এরর মেসেজ দেখানো যেতে পারে
            });
    };

    // সাইডবার টগল করার ফাংশন
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // স্ক্রিন সাইজ পরিবর্তন হলে সাইডবার বন্ধ করার লজিক (মোবাইলের জন্য)
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) { // lg breakpoint
                setIsSidebarOpen(false); // বড় স্ক্রিনে সাইডবার বন্ধ রাখুন (যদি খোলা থাকে)
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="flex min-h-screen bg-neutral-bg-section-light dark:bg-neutral-bg-dark">
            {/* Sidebar Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
                onClick={toggleSidebar}
                aria-hidden="true"
            ></div>

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-neutral-bg-light dark:bg-neutral-bg-section-dark shadow-lg transform transition-transform duration-300 ease-in-out
                   ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex-shrink-0 lg:h-auto lg:shadow-none
                   border-r border-neutral-border-light dark:border-neutral-border-dark`}
            >
                <div className="flex flex-col items-center p-4 border-b border-neutral-border-light dark:border-neutral-border-dark">
                    <div className="flex justify-between w-full items-center mb-4 lg:mb-0">
                        <Link to='/' className="text-xl font-bold text-primary dark:text-accent-dark">
                            <WorkSphereLogo />
                        </Link>
                        <button onClick={toggleSidebar} className="lg:hidden text-neutral-text-primary-light dark:text-neutral-text-primary-dark p-2 rounded-md hover:bg-neutral-bg-card-light dark:hover:bg-neutral-border-dark">
                            <FaTimes size={20} />
                        </button>
                    </div>
                    {/* User Profile Info in Sidebar */}
                    {user && (
                        <div className="flex flex-col items-center mt-4 mb-6">
                            <img
                                src={user.photoURL || "https://i.ibb.co/2kRZ3mZ/default-user.png"}
                                alt="user profile"
                                className="w-20 h-20 rounded-full object-cover border-4 border-primary dark:border-accent shadow-md"
                            />
                            <p className="mt-3 text-lg font-semibold text-neutral-text-primary-light dark:text-neutral-text-primary-dark">
                                {user.displayName || "User"}
                            </p>
                            <span className="text-sm text-neutral-text-secondary-light dark:text-neutral-text-secondary-dark capitalize">
                                {userRole}
                            </span>
                        </div>
                    )}
                </div>
                <nav className="p-4 flex-1"> {/* flex-1 যোগ করা হয়েছে যাতে nav কন্টেন্ট স্পেস নিতে পারে */}
                    <ul className="space-y-2">
                        {dashboardLinks.map((link) => (
                            <li key={link.name}>
                                <NavLink
                                    to={link.path}
                                    end={link.path === '/dashboard'} // 'exact' prop replaced by 'end' for NavLink
                                    className={({ isActive }) =>
                                        `flex items-center p-3 rounded-lg font-medium transition-colors duration-200
                                         ${isActive
                                            ? 'bg-primary text-neutral-text-primary-dark shadow-md transform translate-x-1' // অ্যাক্টিভ লিংক আরও আকর্ষণীয়
                                            : 'text-neutral-text-secondary-light hover:bg-neutral-bg-card-light dark:text-neutral-text-secondary-dark dark:hover:bg-neutral-bg-dark'
                                        }`
                                    }
                                    onClick={() => setIsSidebarOpen(false)} // লিংক ক্লিক করলে মোবাইল সাইডবার বন্ধ হবে
                                >
                                    <span className="mr-3">{link.icon}</span>
                                    {link.name}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
                {/* Logout button at the bottom of sidebar */}
                <div className="p-4 border-t border-neutral-border-light dark:border-neutral-border-dark">
                    <button
                        onClick={handleLogout}
                        className="flex items-center p-3 rounded-lg font-medium transition-colors duration-200 w-full text-left
                                   text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                        <span className="mr-3"><FaSignOutAlt /></span>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                {/* Header (Dashboard specific) */}
                <header className="bg-neutral-bg-light dark:bg-neutral-bg-section-dark p-4 shadow-md flex items-center justify-between lg:justify-end border-b border-neutral-border-light dark:border-neutral-border-dark z-30">
                    <button onClick={toggleSidebar} className="lg:hidden text-neutral-text-primary-light dark:text-neutral-text-primary-dark p-2 rounded-md hover:bg-neutral-bg-card-light dark:hover:bg-neutral-border-dark">
                        <FaBars size={25} />
                    </button>
                    <div className="flex items-center space-x-4">
                        {user?.displayName && (
                            <span className="text-lg font-semibold text-neutral-text-primary-light dark:text-neutral-text-primary-dark hidden md:block">
                                Welcome, {user.displayName}!
                            </span>
                        )}
                        {/* User Profile Avatar in Header (optional, if not in sidebar) */}
                        {/* <div className="w-10 h-10 rounded-full bg-primary-dark dark:bg-blue-400 flex items-center justify-center text-neutral-text-primary-dark text-lg font-bold">
                            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                        </div> */}
                    </div>
                </header>

                {/* Content Outlet */}
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-neutral-bg-section-light dark:bg-neutral-bg-dark">
                    <Outlet /> {/* নেস্টেড রাউটগুলো এখানে রেন্ডার হবে */}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
