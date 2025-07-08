import axios from 'axios';
import useAuth from './useAuth';

const axiosSecure = axios.create({
    baseURL: 'http://localhost:3000',
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