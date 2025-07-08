import { useLocation, useNavigate } from "react-router"; // react-router-dom থেকে ইম্পোর্ট করুন
import Swal from "sweetalert2";
import useAuth from "../../../hooks/useAuth";

const GoogleSignIn = () => {
    const { googleSignIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || '/';

    const handleGoogleLogin = async () => { // async যোগ করা হয়েছে
        try {
            const result = await googleSignIn();
            const user = result.user;
            console.log("Google Login Success:", user);

            // এখানে ইউজারকে ডেটাবেসে সেভ করার লজিক যোগ করতে পারেন
            // যদি ইউজার নতুন হয়, তাহলে তাকে 'Employee' রোল দিয়ে ডেটাবেসে সেভ করুন
            // const userInfo = {
            //     email: user.email,
            //     name: user.displayName,
            //     photoURL: user.photoURL,
            //     role: 'Employee', // সোশ্যাল লগইনের জন্য ডিফল্ট রোল 'Employee'
            //     bank_account_no: '', // ডিফল্ট বা র্যান্ডম
            //     salary: 0, // ডিফল্ট বা র্যান্ডম
            //     designation: '', // ডিফল্ট বা র্যান্ডম
            //     isVerified: false
            // };
            // await axios.post('/api/users', userInfo); // আপনার ব্যাকএন্ড API এন্ডপয়েন্ট

            Swal.fire({
                icon: "success",
                title: "Login Successful",
                text: `Welcome ${user.displayName}`,
                confirmButtonColor: "#3085d6",
                background: 'var(--color-bg-primary)',
                color: 'var(--color-text-primary)'
            });

            navigate(from);
        } catch (error) {
            console.error("Google Login Error:", error.message);
            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text: error.message,
                confirmButtonColor: "#d33",
                background: 'var(--color-bg-primary)',
                color: 'var(--color-text-primary)'
            });
        }
    };

    return (
        <div>
            <button
                onClick={handleGoogleLogin}
                className="inline-flex items-center justify-center px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow-sm" // Daisy UI 'btn' ক্লাস পরিবর্তন করা হয়েছে
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
