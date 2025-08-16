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
import EmployeeDashboardHome from "../pages/employee/EmployeeDashboardHome";
import ErrorPage from "../utils/ErrorPage";
import About from "../pages/home/about/About";


export const router = createBrowserRouter([
  {
    path: "/",
    errorElement:<ErrorPage />,
    element: <MainLayouts />,
    handle: { title: "workSphere" },
    children: [
      {index: true, Component: Home,handle: { title: "Home | workSphere" }},
      { path: 'contact',Component: ContactUs,handle: { title: "ContactUs | workSphere" }},
      {path: 'features',Component: Features,handle: { title: "Features | workSphere" }},
      {path: 'about',Component: About,handle: { title: "About | workSphere" }}
    ]
  },
  {
    path: '/',
    Component: AuthLayout,
    children: [
      {path: 'signIn', Component: SignIn,handle: { title: "SignIn | workSphere" }},
      {path: 'register',Component: Register,handle: { title: "Register | workSphere" }}
    ]
  },
  {
    path: '/dashboard',
    element: <PrivateRoute><DashboardLayout /></PrivateRoute>,
    children: [
      {index: true,Component: DashboardHome,handle: { title: "Dashboard | workSphere" }},
      { path: 'profile', Component: UserProfileCard,handle: { title: "Profile | workSphere" } },

      /* Employee Routes */
      { path: 'employee-home', Component: EmployeeDashboardHome, handle: { title: "Employee Dashboard | workSphere" } },
      { path: 'my-work-sheet', Component: MyWorkSheet,handle: { title: "WorkSheet | workSphere" } },
      { path: 'my-payment-history', Component: MyPaymentHistory,handle: { title: "Payment History | workSphere" } },


      /* HR Routes */
      { path: 'hr-home', Component: HRDashboardHome ,handle: { title: "HR Dashboard | workSphere" } },
      { path: 'employee-list', Component: EmployeeList ,handle: { title: "Employee List | workSphere" }},
      { path: 'employee-details/:slug', Component: EmployeeDetails ,handle: { title: "Employee Details | workSphere" }},
      { path: 'progress', Component: Progress,handle: { title: "Progress | workSphere" } },
      { path: 'payment-history', Component: PaymentHistoryHR,handle: { title: "Payment History | workSphere" }  },

      /* Admin Routes */
      { path: 'admin-home', Component: AdminDashboardHome,handle: { title: "Admin Dashboard | workSphere" } },
      { path: 'manage-users', Component: ManageUsers ,handle: { title: "Manage Users | workSphere" }},
      { path: 'all-employee-list', Component: EmployeeList,handle: { title: "Employee List | workSphere" } },
      { path: 'payroll', Component: Payroll,handle: { title: "Payroll | workSphere" } }
    ]
  }
]);