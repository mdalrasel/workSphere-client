import React from 'react';
import { Link } from 'react-router';
import error from '../assets/errorPage.json'
import Lottie from 'lottie-react';

const ErrorPage = () => {
    return (
       <div>
        <section className="flex min-h-screen items-center h-full p-16 text-gray-800">
            <div className="container flex flex-col items-center justify-center px-5 mx-auto my-8">
                <div className="max-w-md text-center">
                    <Lottie animationData={error}/>
                    <p className="text-2xl font-semibold md:text-3xl">Sorry, we could not find this page.</p>
                    <p className="mt-4  text-gray-600">But dont worry, you can find plenty of other things on our <Link to="/" className="text-sky-600 font-bold">  Homepage .</Link></p>
                    
                </div>
            </div>
        </section>
        
    </div>
    );
};

export default ErrorPage;