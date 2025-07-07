import { createBrowserRouter } from "react-router";
import MainLayouts from "../layouts/MainLayouts";
import Home from "../pages/home/Home";

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
]);