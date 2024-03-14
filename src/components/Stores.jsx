import "./Stores.css";
import { useState, useContext, useEffect } from "react";
import Drawer from "./Drawer";
import sharedContext from "../context/SharedContext";
import Loader from "./Loader";
import toast from "react-hot-toast";
import SideNav from "./SideNav";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import closeIcon from "../../utils/closeIcon.svg";

const Stores = () => {
  const { setLoader, token, isSideNavOpen } = useContext(sharedContext);
  const [storesData, setStoresData] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    getAllStores();
  }, []);

  const getAllStores = () => {
    setLoader(true);
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(`${import.meta.env.VITE_BASE_URL}/admin/getAllStores`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log(result.data);
        if (result.status == 200) {
          setStoresData(result.data);
        }
        setLoader(false);
      })
      .catch((error) => {
        console.log("error", error.message);
        setLoader(false);
      });
  };

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

  const [selectedClient, setSelectedClient] = useState(null);

  const handleClientClick = (clientIndex) => {
    // Set the selected client index when a client is clicked
    setSelectedClient(clientIndex);
  };

  const handleCloseClick = () => {
    // Reset the selected client when the close button is clicked
    setSelectedClient(null);
  };

  const handleDeleteClick = (storeId) => {
    console.log("delete clicked");
    // Reset the selected client when the close button is clicked
    setLoader(true);
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({ storeId });

    var requestOptions = {
      method: "PUT",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(`${import.meta.env.VITE_BASE_URL}/admin/deleteStore`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        if (result.status == 200) {
          getAllStores();
          toast.success("Deleted Store Successfully");
        } else if (result.status == 201) {
          toast.error(result.message);
        }
        setLoader(false);
      })
      .catch((error) => {
        console.log("error", error);
        setLoader(false);
      });
  };

  return (
    <div className="stores_box">
      <Drawer
        anchor="right"
        toggleDrawer={toggleDrawer}
        isOpen={isDrawerOpen}
        current={current}
        getAllStores={getAllStores}
      />
      <Loader />
      <div className="create_con">
        <button
          className="create_button"
          onClick={(event) => toggleDrawer(event, true, "createStore")}
          style={{ width: "max-content" }}
          name="upload"
        >
          <h4>Create Store</h4>
        </button>
      </div>
      <div className="storesData_box">
        <div className="heading_con">
          <h2 className="font-medium text-xl">Stores</h2>
        </div>
        <div className="stores_box">
          <div className="stores_con">
            {storesData.length !== 0 ? (
              storesData?.map((storeData, index) => (
                <div key={index} className="store_box">
                  <div className="store_con">
                    <div
                      className="flex gap-1 cursor-pointer noWhiteSpace"
                      onClick={() => handleClientClick(index)}
                    >
                      <p className="font-bold text-20">Store Name :</p>
                      <p className="noWhiteSpace">{storeData?.storeName}</p>
                    </div>
                    {selectedClient === index && (
                      <img
                        src={closeIcon}
                        alt="closeIcon"
                        onClick={handleCloseClick}
                        className="w-5 cursor-pointer"
                      />
                    )}
                  </div>
                  {selectedClient === index && (
                    <div key={index} className="p-5">
                      <div className="flex items-center gap-1 mb-5">
                        <p className="font-bold text-20">Client Name :</p>
                        <p>{storeData?.clientName}</p>
                      </div>
                      <div className="flex items-center gap-1 mb-5">
                        <p className="font-bold text-20">Email Id :</p>
                        <p>{storeData?.emailId}</p>
                      </div>
                      <div className="flex items-center gap-1 mb-5">
                        <p className="font-bold text-20">Password :</p>
                        <p>{showPassword ? storeData?.password : "••••••••"}</p>
                        <button onClick={handleTogglePasswordVisibility}>
                          {showPassword ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </button>
                      </div>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded-md"
                        onClick={() => handleDeleteClick(storeData?.storeId)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p style={{ textAlign: "center" }}>No data to show</p>
            )}
          </div>
        </div>
      </div>
      <div className={`side_nav ${isSideNavOpen ? "open" : ""}`}>
        <SideNav />
      </div>
    </div>
  );
};

export default Stores;
