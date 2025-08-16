import { useState, useEffect, useRef } from "react";
import { IoMenu } from "react-icons/io5";
import { Link, NavLink, useNavigate } from "react-router"; 
import WorkSphereLogo from "../../utils/WorkSphereLogo";
import useAuth from "../../hooks/useAuth";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { user, logOut } = useAuth();
    const navigate = useNavigate();

    const dropdownRef = useRef(null); 
    const menuRef = useRef(null); 
    const menuButtonRef = useRef(null); 
    useEffect(() => {
        const handleClickOutside = (event) => {
            
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }

            
            if (menuOpen && menuRef.current && !menuRef.current.contains(event.target) &&
                menuButtonRef.current && !menuButtonRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

      
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);
    const navLink = (
        <>
            <li><NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink></li>
            <li><NavLink to="/features" onClick={() => setMenuOpen(false)}>Features</NavLink></li>
            <li><NavLink to="/about" onClick={() => setMenuOpen(false)}>About</NavLink></li>
            <li><NavLink to="/contact" onClick={() => setMenuOpen(false)}>Contact Us</NavLink></li>
            {
                user &&
                <li><NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</NavLink></li>
            }
        </>
    );

    const handleLogout = () => {
        logOut()
            .then(() => {
                navigate('/signIn');
                setDropdownOpen(false); 
                setMenuOpen(false); 
            })
            .catch(err => {
                console.error("Logout error:", err);
            });
    };

    return (
        <nav className="py-2 "> 
            <div className=" flex items-center justify-between px-4">

                
                <div className="flex items-center space-x-4">
                    <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden text-gray-800 dark:text-white" ref={menuButtonRef}>
                        <IoMenu size={25} />
                    </button>

                    <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white">
                        <WorkSphereLogo />
                    </Link>
                </div>

               
                <div className="hidden lg:flex lg:flex-row lg:items-center space-x-6">
                    <ul className="flex flex-row items-center gap-5 text-gray-700 dark:text-gray-300">
                        {navLink}
                    </ul>
                </div>

               
                {menuOpen && (
                    <div ref={menuRef} className="lg:hidden absolute top-16 left-0 w-1/3 bg-gray-100 dark:bg-gray-700 shadow-lg py-4 z-40">
                        <ul className="flex flex-col items-start px-4 space-y-3 text-gray-800 dark:text-gray-200">
                            {navLink}
                        </ul>
                    </div>
                )}

               
                <div className="relative flex items-center space-x-4" ref={dropdownRef}>
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); 
                                    setDropdownOpen(!dropdownOpen);
                                }}
                                className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-600 dark:border-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <img
                                    src={user.photoURL || "https://i.ibb.co/2kRZ3mZ/default-user.png"}
                                    alt="user"
                                    className="w-full h-full object-cover"
                                />
                            </button>

                          
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 bg-white dark:bg-gray-700 shadow-lg rounded-md py-2 w-40 z-50 border border-gray-200 dark:border-gray-600">
                                    <p className="px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{user.displayName || "User"}</p>
                                    <Link to="/dashboard/profile" onClick={() => { setDropdownOpen(false); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                                        Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/signIn')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors shadow-md"
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
