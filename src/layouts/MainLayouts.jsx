import React from 'react';
import { Outlet } from 'react-router';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import Container from '../components/container/Container';

const MainLayouts = () => {
    return (
        <div>
            <div className="bg-amber-200 shadow-sm fixed z-50 right-0 left-0 top-0">
                <Container>
                    <Navbar />
                </Container>
            </div>

            <div className='min-h-[calc(100vh-361px)]'>
                <Outlet />
            </div>
            <div className=' shadow-inner bg-amber-100'>
                <Container>
                    <Footer />
                </Container>
            </div>

        </div>
    );
};

export default MainLayouts;