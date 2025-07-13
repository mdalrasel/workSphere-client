import axios from 'axios';
import useAuth from './useAuth';

const axiosSecure = axios.create({
    baseURL: 'https://work-sphere-server-alpha.vercel.app',
    withCredentials: true,
});

const useAxiosSecure = () => {
    const { user } = useAuth();

    axiosSecure.interceptors.request.use(
        (config) => {
            if (user?.accessToken) {
                config.headers.authorization = `Bearer ${user.accessToken}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    return axiosSecure;
};

export default useAxiosSecure;