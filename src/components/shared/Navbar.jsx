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

    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    const navLink = <>
        <li><NavLink to="/">Home</NavLink></li>
        <li><NavLink to="/contact-us">Contact Us</NavLink></li>
        <li><NavLink to="/dashboard">Dashboard</NavLink></li>
        <li><NavLink to="/about">About</NavLink></li>
    </>

    const handleLogout = () => {
        logOut()
            .then(() => {
                console.log("Logged out");
            })
            .catch(err => {
                console.error("Logout error:", err);
            });
    };

    return (
        <nav className="py-2">
            <div className="flex items-center justify-between">

                {/* Left: Hamburger + Logo */}
                <div className="flex items-center space-x-4">
                    <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden">
                        <IoMenu size={25} />
                    </button>

                    <Link to="/" className="text-xl font-bold text-gray-800">
                        <WorkSphereLogo />
                    </Link>
                </div>

                {/* Center: Menu Items */}
                <div className={`flex-col lg:flex lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-6 absolute lg:static w-full lg:w-auto ${menuOpen ? 'top-17 left-0' : 'hidden'} lg:flex`}>
                    <ul className={`flex ${menuOpen ? 'flex-col items-start bg-amber-300 p-4 w-1/3 gap-3' : 'flex-row items-center gap-5'}`}>
                        {navLink}
                    </ul>
                </div>

                {/* Right: Profile / Button */}
                <div className="relative flex items-center space-x-4" ref={dropdownRef}>
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); 
                                    setDropdownOpen(!dropdownOpen);
                                }}
                                className="w-10 h-10 rounded-md overflow-hidden border border-gray-300"
                            >
                                <img
                                    src={user.photoURL || "https://i.ibb.co/2kRZ3mZ/default-user.png"}
                                    alt="user"
                                    className="w-full h-full object-cover"
                                />
                            </button>

                            {/* Dropdown */}
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 bg-white shadow-md rounded-md py-2 w-40 z-50">
                                    <p className="px-4 py-2 text-sm text-gray-700">{user.displayName || "User"}</p>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/signIn')}
                            className="btn-custom"
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
