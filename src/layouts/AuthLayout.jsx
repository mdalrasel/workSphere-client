import { Link, Outlet } from 'react-router';
import Container from '../components/container/Container';
import WorkSphereLogo from '../utils/WorkSphereLogo';

const AuthLayout = () => {
    return (
        <div className="bg-amber-200 min-h-screen pt-10">

            <Container>
                <Link>
                    <WorkSphereLogo />
                </Link>
                
                <div>
                    <div className=''>
                        <Outlet />
                    </div>
                </div>
            </Container>

        </div>
    );
};

export default AuthLayout;