import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import useAuth from '../../../hooks/useAuth';
import Container from '../../../components/container/Container';
import GoogleSignIn from './GoogleSignIn';

const SignIn = () => {
    const { signIn } = useAuth();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const from = location.state?.from || '/';

    const onSubmit = async (data) => {
        try {
            const result = await signIn(data.email, data.password);
            Swal.fire({
                icon: "success",
                title: "Welcome Back!",
                text: "You have logged in successfully.",
                confirmButtonColor: "#3085d6"
            });
            console.log(result)
            navigate(from);
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text: error.message,
                confirmButtonColor: "#d33"
            });
        }
    };

    return (
        <Container>
            <div className='flex flex-col lg:flex-row  items-center justify-center gap-5 shadow-md rounded'>
                
                {/* Lottie Animation */}
                <div className="flex-1">
                    <lottie-player
                        autoplay
                        controls
                        loop
                        mode="normal"
                        src="/Animation1.json"
                        class="w-40 h-40 md:w-60 md:h-60 lg:w-80 lg:h-80 mx-auto"
                    />
                </div>

                {/* Login Form */}
                <div className="p-6  w-full max-w-md">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Email */}
                        <label className="label">Email</label>
                        <input
                            type="email"
                            {...register('email', { required: "Email is required" })}
                            className="py-2 px-4 rounded-md border  w-full"
                            placeholder="Your Email"
                        />

                        {/* Password with Toggle */}
                        <label className="label mt-4">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                {...register('password', {
                                    required: "Password is required",
                                    minLength: { value: 6, message: "Password must be at least 6 characters" },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                                        message: "Password must include uppercase, lowercase, and a number"
                                    }
                                })}
                                className=" py-2 px-4 rounded-md border w-full pr-10"
                                placeholder="Password"
                            />
                            <div
                                className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                            </div>
                        </div>
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}

                        <div className="m-2"><a className="link link-hover">Forgot password?</a></div>

                        <button className="mt-5 px-6 py-2 border  font-semibold rounded-md transition w-full dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-white">Login</button>
                        <p className="mt-3">Have not an account? please <Link to='/register' className="text-blue-500 text-xl font-bold hover:underline">Register</Link></p>
                    </form>

                    <div className="text-center py-4">
                        <p className='pb-3'>---OR---</p>
                        <GoogleSignIn />
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default SignIn;
