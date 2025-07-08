import { createBrowserRouter } from "react-router";
import MainLayouts from "../layouts/MainLayouts";
import Home from "../pages/home/Home";
import SignIn from "../pages/home/auth/SignIn";
import AuthLayout from "../layouts/AuthLayout";
import Register from "../pages/home/auth/Register";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayouts />,
    children:[
        {
            index:true,
            path:'/',
            Component:Home
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
]);