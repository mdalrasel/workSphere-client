// src/hooks/useUserRole.js
import { useQuery } from '@tanstack/react-query';
import useAuth from './useAuth';
import useAxiosSecure from './useAxiosSecure';

const useUserRole = () => {
    const { user, loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();

    const { data: role = null, isLoading, isError, error } = useQuery({
        queryKey: ['userRole', user?.email], // user.email পরিবর্তন হলে রোল রি-ফেচ হবে
        enabled: !authLoading && !!user?.email, // Firebase Auth লোডিং শেষ হলে এবং user.email থাকলে ফেচ করুন
        queryFn: async () => {
            if (!user?.email) {
                return null; // যদি ইমেইল না থাকে, রোল null
            }
            try {
                const res = await axiosSecure.get(`/users?email=${user.email}`);
                // সার্ভার থেকে পুরো ইউজার অবজেক্ট আসে, আমরা শুধু role প্রপার্টি চাই
                return res.data.role; 
            } catch (err) {
                console.error("Error fetching user role:", err);
                // যদি 404 আসে, তার মানে ইউজার ডেটাবেসে নেই, রোল null হবে
                if (err.response?.status === 404) {
                    return null; 
                }
                throw err; // অন্য এরর হলে থ্রো করুন
            }
        },
       
    });

    return { role, isLoading, isError, error };
};

export default useUserRole;
