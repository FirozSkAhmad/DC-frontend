import "./SideBar.css";
import { useContext } from "react";
import sharedContext from "../context/SharedContext";
import overview from "../../utils/overview.svg";
import products from "../../utils/products.svg";
import stores from "../../utils/stores.svg";
import uploadSales from "../../utils/uploadSales.svg";
import billing from "../../utils/billingIcon.svg";
import logout from "../../utils/logout.svg";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const SideBar = () => {
  const { setUserRole, setToken, userRole } = useContext(sharedContext);

  const location = useLocation();
  const navigate = useNavigate();

  // Function to check if the current route matches a given path
  const isRouteActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    sessionStorage.clear();
    setToken(null);
    setUserRole(null);
    toast.success("logged out Successfully");
    navigate("/login");
  };

  return (
    <div className="sideNav_con">
      <div className="Routes_con">
        {userRole === "SUPER ADMIN" && (
          <div className="categories_con">
            <NavLink
              style={{
                textDecoration: "none",
                color: "white",
                backgroundColor: isRouteActive("/overview")
                  ? "gray"
                  : "transparent",
                borderRadius: "5px",
              }}
              to="/overview"
            >
              <div className="category">
                <img src={overview} alt="News SVG" />
                <h3>Overview</h3>
              </div>
            </NavLink>
            <NavLink
              style={{
                textDecoration: "none",
                color: "white",
                backgroundColor: isRouteActive("/products")
                  ? "gray"
                  : "transparent",
                borderRadius: "5px",
              }}
              to="/products"
            >
              <div className="category">
                <img src={products} alt="insights SVG" />
                <h3>Products</h3>
              </div>
            </NavLink>
            <NavLink
              style={{
                textDecoration: "none",
                color: "white",
                backgroundColor: isRouteActive("/stores")
                  ? "gray"
                  : "transparent",
                borderRadius: "5px",
              }}
              to="/stores"
            >
              <div className="category">
                <img src={stores} alt="caseStudies SVG" />
                <h3>Stores</h3>
              </div>
            </NavLink>
          </div>
        )}
        {userRole === "CLIENT" && (
          <div className="categories_con">
            <NavLink
              style={{
                textDecoration: "none",
                color: "white",
                backgroundColor: isRouteActive("/uploadSales")
                  ? "gray"
                  : "transparent",
                borderRadius: "5px",
              }}
              to="/uploadSales"
            >
              <div className="category">
                <img src={uploadSales} alt="uploadSales SVG" />
                <h3>Upload Sales</h3>
              </div>
            </NavLink>
            <NavLink
              style={{
                textDecoration: "none",
                color: "white",
                backgroundColor: isRouteActive("/billing")
                  ? "gray"
                  : "transparent",
                borderRadius: "5px",
              }}
              to="/billing"
            >
              <div className="category">
                <img src={billing} alt="billing SVG" />
                <h3>Billing</h3>
              </div>
            </NavLink>
          </div>
        )}
        <div className="logout_con" onClick={handleLogout}>
          <h3>
            <u>Logout</u>
          </h3>
          <img src={logout} alt="logout SVG" />
        </div>
      </div>
      <h4>Powered by @Lexodd</h4>
    </div>
  );
};

export default SideBar;
