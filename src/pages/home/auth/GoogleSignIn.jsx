import { useLocation, useNavigate } from "react-router";
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const GoogleSignIn = () => {
    const { googleSignIn } = useAuth();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || '/';

    const handleGoogleLogin = async () => {
        try {
            const result = await googleSignIn();
            const user = result.user;
            console.log("Google Login Success:", user);

            const saveUser = {
                name: user.displayName,
                email: user.email,
                role: "Employee",
                photo: user.photoURL,
                designation: '',
                salary: 0,
                bank_account_no: '',
                isVerified: false,
                uid: user.uid, 
            };

            //  Check if user exists
            let userExists = false;
            try {
                const existingUserRes = await axiosSecure.get(`/users?uid=${user.uid}`);
                if (existingUserRes.data && existingUserRes.data.uid === user.uid) {
                    userExists = true;
                }
            } catch (error) {
                if (error.response?.status === 404) {
                    userExists = false;
                } else {
                    throw error; // other errors
                }
            }

            //  If user doesn't exist, create new
            if (!userExists) {
                await axiosSecure.post('/users', saveUser);
            }

            Swal.fire({
                icon: "success",
                title: "Login Successful",
                text: `Welcome ${user.displayName}`,
                confirmButtonColor: "#3085d6",
                background: "#1f2937",
                color: "#f3f4f6"
            });

            navigate(from);
        } catch (error) {
            console.error("Google Login Error:", error.message);
            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text: error.response?.data?.message || error.message,
                confirmButtonColor: "#d33",
            });
        }
    };

    return (
        <div>
            <button
                onClick={handleGoogleLogin}
                className="inline-flex items-center justify-center px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow-sm"
            >
                <svg aria-label="Google logo" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="mr-2">
                    <path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341" />
                    <path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57" />
                    <path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73" />
                    <path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55" />
                </svg>
                Login with Google
            </button>
        </div>
    );
};

export default GoogleSignIn;
