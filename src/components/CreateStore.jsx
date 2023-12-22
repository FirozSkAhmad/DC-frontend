import "./CreateStore.css";
import { useState } from "react";
import sharedContext from "../context/SharedContext";
import { useContext } from "react";
import { TextField } from "@mui/material";
import toast from "react-hot-toast";

import Loader from "./Loader";

const CreateStore = ({ handleClose, getAllStores }) => {
  const { setLoader, token } = useContext(sharedContext);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    storeName: "",
    emailId: "",
    password: "",
    clientName: "",
    roleType: "CLIENT",
  });

  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (
      formData.storeName &&
      formData.emailId &&
      formData.password &&
      formData.clientName
    ) {
      setMessage("");
    }
  };

  const clearFields = () => {
    setFormData({
      storeName: "",
      emailId: "",
      password: "",
      clientName: "",
      roleType: "CLIENT",
    });
  };

  const validateForm = () => {
    return (
      formData.storeName &&
      formData.emailId &&
      formData.password &&
      formData.clientName
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setMessage("Please fill in all required fields.");
      return;
    }
    setLoader(true);
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify(formData);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(`${import.meta.env.VITE_BASE_URL}/admin/createStore`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        if (result.status == 401) {
          clearFields();
          handleClose();
          toast.error(result.message);
        } else if (result.status == 500) {
          clearFields();
          handleClose();
          alert(result.message);
        } else if (result.message == "Success") {
          clearFields();
          handleClose();
          getAllStores();
          toast.success("Created Store Successfully");
        }
        setLoader(false);
      })
      .catch((error) => {
        console.log("error", error);
        setLoader(false);
      });
  };

  return (
    <div className="card">
      <Loader />
      <div className="card_name">
        <h2>Create Store</h2>
      </div>
      <div className="actions_con">
        <div className="deatails__Fld">
          <p>Store Name*</p>
          <TextField
            className="text__Fld"
            status="text"
            value={formData.storeName}
            onChange={onChangeInput}
            placeholder="Enter Store Name"
            required
            autoComplete="off"
            name="storeName"
          />
        </div>
        <div className="deatails__Fld">
          <p>Client Name*</p>
          <TextField
            className="text__Fld"
            status="text"
            value={formData.clientName}
            onChange={onChangeInput}
            placeholder="Enter Client Name"
            required
            autoComplete="off"
            name="clientName"
          />
        </div>
        <div className="deatails__Fld">
          <p>Email Id*</p>
          <TextField
            className="text__Fld"
            status="text"
            value={formData.emailId}
            onChange={onChangeInput}
            placeholder="Enter Email Id"
            required
            autoComplete="off"
            name="emailId"
          />
        </div>
        <div className="deatails__Fld">
          <p>Password*</p>
          <TextField
            className="text__Fld"
            status="text"
            value={formData.password}
            onChange={onChangeInput}
            placeholder="Enter Store Name"
            required
            autoComplete="off"
            name="password"
          />
        </div>
        <div className="deatails__Fld">
          <p>Role Type</p>
          <TextField
            className="text__Fld"
            status="text"
            value={formData.roleType}
            disabled
            placeholder="Enter Role Type"
            required
            autoComplete="off"
            name="roleType"
          />
        </div>
        <div style={{ color: "red" }}>{message}</div>
        <div className="Btns__container">
          <button onClick={handleClose}>Close</button>
          <button onClick={handleSubmit}>Create</button>
        </div>
      </div>
    </div>
  );
};

export default CreateStore;
