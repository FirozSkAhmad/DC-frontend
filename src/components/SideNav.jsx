import "./SideNav.css";
import overview from "../../utils/overview.svg";
import products from "../../utils/products.svg";
import stores from "../../utils/stores.svg";
import logout from "../../utils/logout.svg";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import sharedContext from "../context/SharedContext";
import closeIcon from "../../utils/closeIcon.svg";
import uploadSales from "../../utils/uploadSales.svg";
import billing from "../../utils/billingIcon.svg";
import userIcon from "../../utils/userIcon.svg";
import toast from "react-hot-toast";

const SideNav = () => {
  const { isSideNavOpen, setIsSideNavOpen, setUserRole, setToken, userRole } =
    useContext(sharedContext);

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
    setIsSideNavOpen(false)
    toast.success("logged out Successfully");
    navigate("/login");
  };

  return (
    <div className="sideNav_con">
      <div className="closeBtn_con">
      <div className="user_con">
          <img className="userIcon" src={userIcon} alt="userIcon SVG" />
          <h2>{userRole}</h2>
        </div>
        <img
          src={closeIcon}
          alt="closeIcon"
          onClick={() => setIsSideNavOpen(!isSideNavOpen)}
        />
      </div>
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
              onClick={() => setIsSideNavOpen(false)}
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
              onClick={() => setIsSideNavOpen(false)}
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
              onClick={() => setIsSideNavOpen(false)}
            >
              <div className="category">
                <img src={stores} alt="caseStudies SVG" />
                <h3>Stores</h3>
              </div>
            </NavLink>
          </div>
        )}
        {userRole === "EXECUTIVE" && (
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
              onClick={() => setIsSideNavOpen(false)}
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
              onClick={() => setIsSideNavOpen(false)}
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

export default SideNav;
