import "@lottiefiles/lottie-player";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router"; 
import { updateProfile } from "firebase/auth";
import Swal from "sweetalert2";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import GoogleSignIn from "./GoogleSignIn";
import useAuth from "../../../hooks/useAuth";
import Container from "../../../components/container/Container";
import useAxiosSecure from "../../../hooks/useAxiosSecure"; 

const Register = () => {
    const { createUser } = useAuth();
    const axiosSecure = useAxiosSecure(); 
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const location = useLocation();
    const from = location.state?.from || '/';

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const onSubmit = async (data) => {
        const { name, email, password, role, photo } = data;

        const imageFile = photo[0];
        const formData = new FormData();
        formData.append("image", imageFile);
        const imgbbApiKey = import.meta.env.VITE_imgbbApiKey;
        const uploadUrl = `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`;

        try {
            //  Upload image to imgbb
            const imgRes = await axios.post(uploadUrl, formData);
            if (!imgRes.data.success) throw new Error("Image upload failed");
            const imageUrl = imgRes.data.data.url;

            //  Create user in Firebase
            const res = await createUser(email, password);
            const user = res.user;

            // 3️⃣ Update Firebase profile
            await updateProfile(user, {
                displayName: name,
                photoURL: imageUrl
            });

            //  Save user to DB using axiosSecure (token attach hobe)
            await axiosSecure.post('/users', {
                name,
                email,
                role,
                photo: imageUrl,
                designation: '',
                salary: 0,
                bank_account_no: '',
                isVerified: false,
            });

            Swal.fire({
                icon: "success",
                title: "Registration Successful",
                text: "Welcome to the platform!",
                confirmButtonColor: "#3085d6",
                background: "#1f2937",
                color: "#f3f4f6",
            });

            navigate(from);
        } catch (err) {
            console.error("Registration Error:", err);
            Swal.fire({
                icon: "error",
                title: "Registration Failed",
                text: err.message,
                confirmButtonColor: "#d33",
            });
        }
    };

    return (
        <Container>
            <div className="flex flex-col-reverse lg:flex-row justify-center items-center gap-5 py-10 shadow-md rounded">
                <div className="flex-1 p-6">
                    <h2 className="text-2xl font-bold text-center mb-6">Register for WorkSphere</h2>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Name */}
                        <label className="label block mb-2 text-sm font-medium">Name</label>
                        <input
                            type="text"
                            {...register("name", { required: "Name is required" })}
                            className="py-2 px-4 rounded-md border w-full"
                            placeholder="Your Name"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}

                        {/* Email */}
                        <label className="label block mt-4 mb-2 text-sm font-medium">Email</label>
                        <input
                            type="email"
                            {...register("email", { required: "Email is required" })}
                            className="py-2 px-4 rounded-md border w-full"
                            placeholder="Your Email"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}

                        {/* Photo */}
                        <label className="label block mt-4 mb-2 text-sm font-medium">Photo</label>
                        <input
                            type="file"
                            accept="image/*"
                            {...register("photo", { required: "Photo is required" })}
                            className="file-input file-input-bordered file-input-sm w-full py-2 px-4 border"
                        />
                        {errors.photo && <p className="text-red-500 text-sm mt-1">{errors.photo.message}</p>}

                        {/* Role */}
                        <label className="label block mt-4 mb-2 text-sm font-medium">Role</label>
                        <select
                            {...register("role", { required: "Role is required" })}
                            className="py-2 px-4 rounded-md border w-full"
                        >
                            <option value="">Select a role</option>
                            <option value="Employee">Employee</option>
                            <option value="HR">HR</option>
                        </select>
                        {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}

                        {/* Password */}
                        <label className="label block mt-4 mb-2 text-sm font-medium">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: { value: 6, message: "Password must be at least 6 characters" },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                                        message: "Password must include uppercase, lowercase, and a number"
                                    }
                                })}
                                className="py-2 px-4 rounded-md border w-full"
                                placeholder="Password"
                            />
                            <button
                                type='button'
                                onClick={() => setShowPassword(!showPassword)}
                                className='absolute inset-y-0 right-3 flex items-center cursor-pointer '
                            >
                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}

                        <button
                            type="submit"
                            className="mt-5 px-6 py-2 border font-semibold rounded-md transition w-full dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-white"
                        >
                            Register
                        </button>
                        <p className="mt-3 text-center text-sm ">
                            Already have an Account? <Link to='/signIn' className="text-blue-500 hover:underline dark:text-blue-400 text-xl font-bold">Login</Link>
                        </p>
                    </form>

                    <div className="text-center py-2">
                        <p className='pb-3 '>---OR---</p>
                        <GoogleSignIn />
                    </div>
                </div>

                <div className="flex-1">
                    <lottie-player
                        autoplay
                        controls
                        loop
                        mode="normal"
                        src="/Animation1.json"
                        class="w-80 h-100 mx-auto"
                    />
                </div>
            </div>
        </Container>
    );
};

export default Register;
