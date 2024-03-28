import "./App.css";
import { Outlet, createBrowserRouter, useLocation } from "react-router-dom";
import Protected from "./components/Protected";
import Header from "./components/Header";
import Login from "./pages/Login";
import SideBar from "./components/SideBar";
import Overview from "./components/Overview";
import Products from "./components/Products";
import Stores from "./components/Stores";
import UploadSales from "./components/UploadSales";
import Billing from "./components/Billing";

const App = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  return (
    <>
      {!isLoginPage ? (
        <div className="screen">
          <div className="header">
            <Header />
          </div>
          <div className="sideBar">
            <SideBar />
          </div>
          <div className="main">
            <Outlet />
          </div>
        </div>
      ) : (
        <Outlet />
      )}
    </>
  );
};

const appRouter = createBrowserRouter([
  {
    element: <Protected cmp={<App />} />,
    path: "/",
    children: [
      {
        element: <Login />,
        path: "/login",
      },
      {
        element: (
          <Protected cmp={<Overview />} allowedRoles={["SUPER ADMIN"]} />
        ),
        path: "/overview",
      },
      {
        element: (
          <Protected cmp={<Products />} allowedRoles={["SUPER ADMIN"]} />
        ),
        path: "/products",
      },
      {
        element: <Protected cmp={<Stores />} allowedRoles={["SUPER ADMIN"]} />,
        path: "/stores",
      },
      {
        element: (
          <Protected
            cmp={<UploadSales />}
            allowedRoles={["SUPER ADMIN", "EXECUTIVE"]}
          />
        ),
        path: "/uploadSales",
      },
      {
        element: (
          <Protected
            cmp={<Billing />}
            allowedRoles={["SUPER ADMIN", "EXECUTIVE"]}
          />
        ),
        path: "/billing",
      },
    ],
  },
]);

export default appRouter;
