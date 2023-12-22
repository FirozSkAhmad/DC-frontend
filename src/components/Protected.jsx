import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import sharedContext from "../context/SharedContext";

const Protected = ({ cmp }) => {
  const navigate = useNavigate();
  // const { userRole } = useContext(sharedContext);

  useEffect(() => {
    if (sessionStorage.getItem("userRole") === "SUPER ADMIN") {
      navigate("/overview");
    } else if (sessionStorage.getItem("userRole") === "CLIENT") {
      navigate("/uploadSales");
    } else {
      navigate("/login");
    }
  }, []);

  return cmp;
};

export default Protected;
