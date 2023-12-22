import "./UploadSales.css";
import { useState, useContext } from "react";
import Drawer from "./Drawer";
import sharedContext from "../context/SharedContext";
import uploadIcon from "../../utils/uploadIcon.svg";
import SideNav from "./SideNav";

const UploadSales = () => {
  const { isSideNavOpen } = useContext(sharedContext);

  const [current, setCurrent] = useState("");
  const [isDrawerOpen, setOpenDrawer] = useState(false);

  const toggleDrawer = (event, open, button) => {
    console.log(button);
    if (
      event &&
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      setOpenDrawer(false);
      return;
    }
    setOpenDrawer(open);
    setCurrent(button);
  };
  return (
    <div className="uploadSales_box">
      <Drawer
        anchor="right"
        toggleDrawer={toggleDrawer}
        isOpen={isDrawerOpen}
        current={current}
      />
      <div className="upload_con">
        <button
          className="upload_button"
          onClick={(event) => toggleDrawer(event, true, "upload")}
          style={{ width: "max-content" }}
          name="upload"
        >
          <img className="uploadIcon" src={uploadIcon} alt="uploadIcon SVG" />
          <h4> Upload Sales Data</h4>
        </button>
      </div>
      <p>
        Please upload the csv file with the data of same store name and client
        name as logined user
      </p>
      <div className={`side_nav ${isSideNavOpen ? "open" : ""}`}>
        <SideNav />
      </div>
    </div>
  );
};

export default UploadSales;
