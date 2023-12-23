import "./UploadData.css";
import React, { useState, useContext } from "react";
import sharedContext from "../context/SharedContext";
import Loader from "./Loader";
import toast from "react-hot-toast";

function UploadData({
  handleClose,
  type,
  getProducts,
  getOrders,
  getTotalSales,
}) {
  const { setLoader, token, userRole } = useContext(sharedContext);

  const hiddenFileInput = React.useRef(null);
  const [filename, setFileName] = React.useState();
  const [file, setFile] = useState();

  const handleClick = () => {
    hiddenFileInput?.current?.click();
  };

  const uploadDoc = (event) => {
    setFileName(event.target?.files[0]?.name);
    setFile(event.target?.files[0]);
  };

  const uploadFile = (event) => {
    event.preventDefault();
    if (file) {
      setLoader(true);
      var myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);
      var formdata = new FormData();
      formdata.append("file", file, filename);

      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formdata,
        redirect: "follow",
      };

      if (type === "sales") {
        fetch(
          `${import.meta.env.VITE_BASE_URL}/upload/${
            userRole === "SUPER ADMIN"
              ? "bulkUploadOnlineSales"
              : "bulkUploadOfflineSales"
          }`,
          requestOptions
        )
          .then((response) => response.json())
          .then((result) => {
            console.log(result);
            if (result.status == 500) {
              setLoader(false);
              handleClose();
              console.log(result.error);
              alert(result.error);
            } else if (result.status == 400) {
              setLoader(false);
              handleClose();
              setFile("");
              setFileName("");
              if (userRole === "SUPER ADMIN") {
                getOrders();
                getTotalSales();
              }
              alert(result.message);
            } else {
              setLoader(false);
              handleClose();
              setFile("");
              setFileName("");
              if (userRole === "SUPER ADMIN") {
                getOrders();
                getTotalSales();
              }
              toast.success("Uploaded data successfully");
            }
          })
          .catch((error) => {
            console.log("error", error);
            setLoader(false);
            toast.error("Error while uploading data");
          });
      } else {
        fetch(
          `${import.meta.env.VITE_BASE_URL}/upload/bulkUploadProducts`,
          requestOptions
        )
          .then((response) => response.json())
          .then((result) => {
            if (result.status == 500) {
              setLoader(false);
              handleClose();
              console.log(result.error);
              alert(result.error);
            } else if (result.status == 400) {
              getProducts();
              setLoader(false);
              handleClose();
              setFile("");
              setFileName("");
              alert(result.message);
            }
            else{
              getProducts();
              setLoader(false);
              handleClose();
              setFile("");
              setFileName("");
              toast.success(result.message);
            }
          })
          .catch((error) => {
            console.log("error", error);
            setLoader(false);
            toast.error("Error while uploading data");
          });
      }
    }
  };

  return (
    <div className="uploadCard">
      <Loader />
      <div className="card_name">
        <h2 className="font-bold text-20">Upload CSV File</h2>
      </div>
      <div className="actions_con">
        <div className="browseFile_con">
          <input
            type="file"
            style={{ display: "none" }}
            ref={hiddenFileInput}
            onChange={(event) => uploadDoc(event)}
            accept=".csv"
          />
          <div className="browseFile_texts" disabled>
            <div className="browseFile_input">
              {filename ? filename : "Choose file"}
            </div>
            <button className="browse_btn" onClick={handleClick}>
              Browse files
            </button>
          </div>
        </div>
        <div className="Btns__container">
          <button onClick={handleClose}>Close</button>
          <button onClick={uploadFile}>Upload</button>
        </div>
      </div>
    </div>
  );
}

export default UploadData;
