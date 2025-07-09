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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayouts />,
    children:[
        {
            index:true,
            path:'/',
            Component:Home
        },
        {
            path:'contact',
            Component:ContactUs
        },
        {
            path:'features',
            Component:Features
        }
    ]
  },
 {
    path: '/',
    Component: AuthLayout,
    children: [
      {
        path: 'signIn',
        Component:SignIn
      },
      {
        path: 'register',
        Component:Register
      }
    ]
  },
  {
    path:'/dashboard',
    element:<PrivateRoute><DashboardLayout /></PrivateRoute>,
    children:[
      {
        index: true, 
        Component: DashboardHome,
      },
      {
        path:'profile',
        Component:UserProfileCard
      },
    ]
  }
]);