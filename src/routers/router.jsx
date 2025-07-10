import { createBrowserRouter } from "react-router";
import MainLayouts from "../layouts/MainLayouts";
import Home from "../pages/home/Home";
import SignIn from "../pages/home/auth/SignIn";
import AuthLayout from "../layouts/AuthLayout";
import Register from "../pages/home/auth/Register";
import ContactUs from "../pages/home/contactUs/ContactUs";
import Features from "../pages/home/features/Features";
import DashboardLayout from "../layouts/DashboardLayout";
import PrivateRoute from "./PrivateRoute";
import UserProfileCard from "../components/cards/UserProfileCard";
import DashboardHome from "../Dashboard/dashboardHome/DashboardHome";
import EmployeeHome from "../pages/employee/EmployeeHome";
import MyWorkSheet from "../pages/employee/MyWorkSheet";
import MyPaymentHistory from "../pages/employee/MyPaymentHistory";
import EmployeeList from "../pages/HR/EmployeeList";
import EmployeeDetails from "../pages/HR/EmployeeDetails";
import Progress from "../pages/HR/Progress";
import PaymentHistoryHR from "../pages/HR/PaymentHistoryHR";
import HRDashboardHome from "../pages/HR/HRDashboardHome";
import ManageUsers from "../pages/admin/ManageUsers";
import Payroll from "../pages/admin/Payroll";
import AdminDashboardHome from "../pages/admin/AdminDashboardHome";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayouts />,
    children: [
      {
        index: true,
        path: '/',
        Component: Home
      },
      {
        path: 'contact',
        Component: ContactUs
      },
      {
        path: 'features',
        Component: Features
      }
    ]
  },
  {
    path: '/',
    Component: AuthLayout,
    children: [
      {
        path: 'signIn',
        Component: SignIn
      },
      {
        path: 'register',
        Component: Register
      }
    ]
  },
  {
    path: '/dashboard',
    element: <PrivateRoute><DashboardLayout /></PrivateRoute>,
    children: [
      {
        index: true,
        Component: DashboardHome,
      },
     
      {path: 'profile',Component: UserProfileCard},

       /* Employee Routes */
      {path: 'my-work-sheet', Component: MyWorkSheet},
      {path: 'my-payment-history', Component: MyPaymentHistory},
      {path:'employee-home',Component:EmployeeHome},

      /* HR Routes */
      {path:'hr-home',Component:HRDashboardHome},
      {path:'employee-list',Component:EmployeeList},
      {path:'employee-details/:slug',Component:EmployeeDetails},
      {path:'progress',Component:Progress},
      { path:'payment-history',Component:PaymentHistoryHR},

       /* Admin Routes */
       {path:'admin-home',Component:AdminDashboardHome},
       {path:'manage-users',Component:ManageUsers},
       {path:'all-employee-list',Component:EmployeeList},
       {path:'payroll',Component:Payroll}
    ]
  }
]);