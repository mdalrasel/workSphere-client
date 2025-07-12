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
    const { register, handleSubmit, formState: { errors }, setError, clearErrors } = useForm();
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [generalError, setGeneralError] = useState("");
    const from = location.state?.from || '/';

    const onSubmit = async (data) => {
        try {
            clearErrors();
            setGeneralError("");

            await signIn(data.email, data.password);

            Swal.fire({
                icon: "success",
                title: "Welcome Back!",
                text: "You have logged in successfully.",
                confirmButtonColor: "#3085d6",
                background: "#1f2937",
                color: "#f3f4f6"
            });

            navigate(from);
        } catch (error) {
            const errorCode = error.code;

            if (errorCode === 'auth/user-not-found') {
                setError('email', { type: 'manual', message: 'No account found with this email.' });
            } else if (errorCode === 'auth/wrong-password') {
                setError('password', { type: 'manual', message: 'Incorrect password. Please try again.' });
            } else if (errorCode === 'auth/invalid-email') {
                setError('email', { type: 'manual', message: 'Invalid email format.' });
            } else if (errorCode === 'auth/invalid-credential') {
                setGeneralError("Invalid email or password. Please try again.");
            } else {
                setGeneralError(error.message || "Something went wrong. Please try again later.");
            }
        }
    };

    return (
        <Container>
            <div className='flex flex-col lg:flex-row items-center justify-center gap-5 shadow-md rounded py-8'>
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

                <div className="p-6 w-full max-w-md">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <label className="label">Email</label>
                        <input
                            type="email"
                            {...register('email', { required: "Email is required" })}
                            className="py-2 px-4 rounded-md border w-full"
                            placeholder="Your Email"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}

                        <label className="label mt-4">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                {...register('password', {
                                    required: "Password is required"
                                })}
                                className="py-2 px-4 rounded-md border w-full pr-10"
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

                        <button className="mt-5 px-6 py-2 border font-semibold rounded-md transition w-full dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-white">
                            Login
                        </button>

                        {generalError && (
                            <p className="text-red-500 text-center mt-4">{generalError}</p>
                        )}

                        <p className="mt-3">
                            Have not an account? Please <Link to='/register' className="text-blue-500 text-xl font-bold hover:underline">Register</Link>
                        </p>
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
