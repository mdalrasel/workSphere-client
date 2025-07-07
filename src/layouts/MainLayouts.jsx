import React from 'react';
import { Outlet } from 'react-router';
import MainNavbar from '../components/shared/Navbar';
import MainFooter from '../components/shared/Footer';

const MainLayouts = () => {
    return (
        <div>
            <MainNavbar />
            <div className='min-h-[calc(100vh-130px)]'>
                <Outlet />
            </div>
            <MainFooter />
        </div>
    );
};

export default MainLayouts;