import React from 'react';
import { Outlet } from 'react-router';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import Container from '../components/container/Container';
import { Helmet } from 'react-helmet-async';
import usePageTitle from '../hooks/usePageTitle';

const MainLayouts = () => {
    const pageTitle = usePageTitle();
    return (
        <div>
            <Helmet>
                <title>{pageTitle}</title>
                
            </Helmet>
            <div className="bg-white dark:bg-gray-800 shadow-md fixed z-50 right-0 left-0 top-0">
                <Container>
                    <Navbar />
                </Container>
            </div>

            <div className='min-h-[calc(100vh-361px)] pt-16'>
                <Outlet />
            </div>
            <div className=' shadow-inner '>
                <Container>
                    <Footer />
                </Container>
            </div>

        </div>
    );
};

export default MainLayouts;