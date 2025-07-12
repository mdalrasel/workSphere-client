
import { useQuery } from '@tanstack/react-query';
import useAuth from './useAuth';
import useAxiosSecure from './useAxiosSecure';

const useUserRole = () => {
    const { user, loading: authLoading } = useAuth();
    const axiosSecure = useAxiosSecure();

    const { data: role = null, isLoading, isError, error } = useQuery({
        queryKey: ['userRole', user?.email], 
        enabled: !authLoading && !!user?.email, 
        queryFn: async () => {
            if (!user?.email) {
                return null; 
            }
            try {
                const res = await axiosSecure.get(`/users?email=${user.email}`);
               
                return res.data.role; 
            } catch (err) {
                if (err.response?.status === 404) {
                    return null; 
                }
                throw err; 
            }
        },
       
    });

    return { role, isLoading, isError, error };
};

export default useUserRole;
