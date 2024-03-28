import "./Login.css";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import sharedContext from "../context/SharedContext";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const Login = () => {
  const { setUserRole, setToken, setLoader, setEmailId } =
    useContext(sharedContext);

  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePasswordVisibility = (event) => {
    event.preventDefault(); // Prevent the default form submit action
    setShowPassword(!showPassword);
  };

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emailId: "",
    password: "",
    login_type: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  const onChangeInput = (event) => {
    const { name, value } = event.target;
    setFormData((preState) => {
      return {
        ...preState,
        [name]: value,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoader(true);
    if (!formData.emailId || !formData.password || !formData.login_type) {
      setErrorMsg("Fill all fields");
      return;
    }
    setErrorMsg("");

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify(formData);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(`${import.meta.env.VITE_BASE_URL}/auth/login`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        if (result.status == 404 || result.status == 401) {
          toast.error(result.message);
        } else {
          setUserRole(result.data.role_type);
          setToken(result.data.accessToken);
          setEmailId(result.data.email);
          sessionStorage.setItem("token", result.data.accessToken);
          sessionStorage.setItem("userRole", result.data.role_type);
          if (result.data.role_type === "EXECUTIVE") {
            sessionStorage.setItem("executiveName", result.data.executiveName);
          }
          toast.success("logined Successfully");
          navigate("/overview");
        }
        setLoader(false);
      })
      .catch((error) => {
        console.log("error", error);
        setLoader(false);
      });
  };

  return (
    <div className="login_pg">
      <Loader />
      <h3>DressCode</h3>
      <div>
        <h4>Login</h4>
        <form onSubmit={handleSubmit} className="login_con">
          <div className="input__Fld">
            <input
              type="email"
              value={formData.emailId}
              onChange={onChangeInput}
              placeholder="Email"
              required
              autoComplete="off"
              name="emailId"
            />
          </div>
          <div className="passInput__Fld">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={onChangeInput}
              placeholder="Password"
              required
              autoComplete="off"
              name="password"
            />
            <button
              type="button"
              className="toggle-password-icon"
              onClick={handleTogglePasswordVisibility}
            >
              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </button>
          </div>
          <div className="typIinput__Fld">
            <label>Type of Login*</label>
            <select
              name="login_type"
              value={formData.login_type}
              onChange={onChangeInput}
              required
            >
              <option value="">Select Role</option>
              <option value="ADMIN">ADMIN</option>
              <option value="EXECUTIVE">EXECUTIVE</option>
            </select>
          </div>
          <div>{/* <span style={{ color: "red" }}>{error}</span> */}</div>
          <div className="sbt__Btn">
            <button type="submit">Login</button>
          </div>
        </form>
        <div className="ck__Act">
          <p>©2023 DressCode. All Rights Reserved</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
