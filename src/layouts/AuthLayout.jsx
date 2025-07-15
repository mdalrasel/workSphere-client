import React from 'react';
import { Link, Outlet } from 'react-router';
import Container from '../components/container/Container';
import WorkSphereLogo from '../utils/WorkSphereLogo';
import usePageTitle from '../hooks/usePageTitle';
import { Helmet } from 'react-helmet-async';

const AuthLayout = () => {
     const pageTitle = usePageTitle();
    return (
        <div className=" bg-blue-50 py-10 ">
            <Helmet>
                <title>{pageTitle}</title>
            </Helmet>
            <Container>
                <div className="text-start mb-8">
                    <Link to='/' >
                        <WorkSphereLogo />
                    </Link>
                </div>
            </Container>

            <Container>

                <div className='w-full max-w-4xl mx-auto min-h-screen'>
                    <Outlet />
                </div>
            </Container>
        </div>
    );
};

export default AuthLayout;
