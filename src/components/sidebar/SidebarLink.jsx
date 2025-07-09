import { NavLink } from 'react-router';

const SidebarLink = ({ to, icon, name, end }) => {
  return (
    <li>
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          `flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-200
           ${isActive
              ? 'bg-blue-600 text-white font-semibold shadow'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
           }`
        }
      >
        <span>{icon}</span>
        {name}
      </NavLink>
    </li>
  );
};

export default SidebarLink;
