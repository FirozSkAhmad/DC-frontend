import menuIcon from "../../utils/menu.svg";
import dressCodeLogo from "../../utils/dressCodeLogo.svg";
import userIcon from "../../utils/userIcon.svg";
import { useContext } from "react";
import sharedContext from "../context/SharedContext";
import "./Header.css";
import SideNav from "./SideNav";

const Header = ({ headerName }) => {
  const { isSideNavOpen, setIsSideNavOpen, userRole } =
    useContext(sharedContext);

  const toggleSideNav = () => {
    setIsSideNavOpen(!isSideNavOpen);
  };

  return (
    <div className="header_con">
      <div className="menu_con">
        <img
          className="menu_icon"
          onClick={toggleSideNav}
          src={menuIcon}
          alt="menuIcon SVG"
        />
        <img
          className="dressCode_logo"
          src={dressCodeLogo}
          alt="dressCodeLogo SVG"
        />
      </div>
      <div className="title_con">
        <img
          className="dressCode_logo"
          src={dressCodeLogo}
          alt="dressCodeLogo SVG"
        />
        <div className="user_con">
          <img
            className="userIcon"
            src={userIcon}
            alt="userIcon SVG"
          />
          <h2>{userRole}</h2>
        </div>
      </div>
      <div className={`side_nav ${isSideNavOpen ? "open" : ""}`}>
        <SideNav />
      </div>
    </div>
  );
};

export default Header;
