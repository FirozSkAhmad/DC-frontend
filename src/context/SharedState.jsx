import { useState, useEffect } from "react";
import SharedContext from "./SharedContext";

const SharedState = (props) => {
  const [loader, setLoader] = useState(false);
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [userRole, setUserRole] = useState();
  const [emailId, setEmailId] = useState();
  const [token, setToken] = useState();

  useEffect(() => {
    if (window) {
      setToken(sessionStorage.getItem("token"));
      setUserRole(sessionStorage.getItem("userRole") || null);
    }
  }, []);

  return (
    <SharedContext.Provider
      value={{
        loader,
        setLoader,
        isSideNavOpen,
        setIsSideNavOpen,
        userRole,
        setUserRole,
        emailId,
        setEmailId,
        token,
        setToken,
      }}
    >
      {props.children}
    </SharedContext.Provider>
  );
};

export default SharedState;
