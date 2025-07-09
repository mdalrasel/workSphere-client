// src/components/sidebar/UserProfileCard.jsx
import React from 'react';
import useAuth from '../../hooks/useAuth';

const UserProfileCard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center mt-4 mb-6">
        <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mt-3 animate-pulse"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mt-2 animate-pulse"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userRole = user.role || 'Employee';

  return (
    <div className="flex flex-col items-center mt-4 mb-6">
      <img
        src={user.photoURL || "https://i.ibb.co/2kRZ3mZ/default-user.png"}
        alt="ইউজার প্রোফাইল"
        className="w-20 h-20 rounded-full object-cover border-4 border-blue-600 dark:border-blue-400 shadow-md"
      />
      <p className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
        {user.displayName || "ব্যবহারকারী"}
      </p>
      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
        {userRole}
      </span>
    </div>
  );
};

export default UserProfileCard;