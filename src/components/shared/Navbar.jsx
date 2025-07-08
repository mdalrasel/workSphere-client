import { useState } from "react";
import { IoMenu } from "react-icons/io5";
import { Link, NavLink } from "react-router";
import WorkSphereLogo from "../../utils/WorkSphereLogo";



const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLink = <>
    <li><NavLink>Home</NavLink></li>
    <li><NavLink>Contact Us</NavLink></li>
    <li><NavLink>Dashboard</NavLink></li>
    <li><NavLink>About</NavLink></li>
  </>


  return (
    <nav className="py-2 ">
      <div className=" flex items-center justify-between">

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
        <div className={`flex-col lg:flex lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-6 absolute lg:static  w-full lg:w-auto   lg:p-0 ${menuOpen ? 'top-17 left-0 ' : 'hidden'} lg:flex`}>
          <ul className={`flex ${menuOpen ? 'flex-col items-start bg-amber-300 p-4 w-1/3 gap-3' : 'flex-row items-center gap-5'}`}>
            {navLink}
          </ul>
        </div>

        {/* Right: Button (All Devices) */}
        <div className="flex items-center space-x-4">

          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Action
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;