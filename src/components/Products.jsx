import "./Products.css";
import { useState, useContext, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import Drawer from "./Drawer";
import sharedContext from "../context/SharedContext";
import Loader from "./Loader";
import uploadIcon from "../../utils/uploadIcon.svg";
import SideNav from "./SideNav";
import toast from "react-hot-toast";

const Products = () => {
  const { setLoader, token, isSideNavOpen } = useContext(sharedContext);
  const [rows, setRows] = useState([]);

  const columns = [
    {
      field: "productId",
      headerName: "ID",
      width: 160,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "productName",
      headerName: "Product Name",
      width: 200,
      editable: false,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "size",
      headerName: "Size",
      width: 150,
      editable: false,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "MRP",
      headerName: "MRP",
      type: "number",
      width: 150,
      editable: false,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "quantity",
      headerName: "Quantity",
      type: "number",
      width: 150,
      editable: false,
      align: "center",
      headerAlign: "center",
    },
  ];
  useEffect(() => {
    getProducts();
  }, []);

  const getProducts = () => {
    setLoader(true);
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(`${import.meta.env.VITE_BASE_URL}/admin/getProducts`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (result.status == 200) {
          setRows(result.data);
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

  return (
    <>
      <Drawer
        anchor="right"
        toggleDrawer={toggleDrawer}
        isOpen={isDrawerOpen}
        current={current}
        getProducts={getProducts}
      />
      <Loader />
      <div className="products_con">
        <div className="upload_con">
          <button
            className="upload_button"
            onClick={(event) => toggleDrawer(event, true, "uploadProducts")}
            // onClick={() => toast.error("Coming Soon!")}
            style={{ width: "max-content" }}
            name="upload"
          >
            <img className="uploadIcon" src={uploadIcon} alt="uploadIcon SVG" />
            <h4> Upload Products</h4>
          </button>
        </div>
        <Box className="products_table">
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              ...rows.initialState,
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            getRowId={(row) => row.productId}
            autoPageSize
            pageSizeOptions={[5, 10, 25]}
            disableSelectionOnClick
            sx={{
              fontWeight: 500,
            }}
            localeText={{ noRowsLabel: "No Products" }}
            className="datagrid"
          />
        </Box>
      </div>
      <div className={`side_nav ${isSideNavOpen ? "open" : ""}`}>
        <SideNav />
      </div>
    </>
  );
};

export default Products;
