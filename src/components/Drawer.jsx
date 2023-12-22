import React from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Loader from "./Loader.jsx";
import UploadData from "./UploadData";
import CreateStore from "./CreateStore.jsx";

const Drawer = ({
  anchor,
  toggleDrawer,
  isOpen,
  current,
  getOrders,
  getTotalSales,
  getProducts,
  getAllStores,
}) => {
  const handleClose = (event) => {
    console.log("closed clicked")
    toggleDrawer(anchor, false, event);
  };

  const descriptionElementRef = React.useRef(null);

  React.useEffect(() => {
    if (isOpen) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [isOpen]);

  const getComponent = () => {
    switch (current) {
      case "upload":
        return (
          <UploadData
            handleClose={handleClose}
            getOrders={getOrders}
            getTotalSales={getTotalSales}
            type="sales"
          />
        );
      case "uploadProducts":
        return (
          <UploadData
            handleClose={handleClose}
            getProducts={getProducts}
            type="products"
          />
        );
      case "createStore":
        return (
          <CreateStore handleClose={handleClose} getAllStores={getAllStores} />
        );
      default:
        <div>
          <Loader />
        </div>;
    }
  };
  return (
    <Dialog
      open={isOpen}
      onClose={(event) => toggleDrawer(anchor, false, event)}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
      PaperProps={{ style: { borderRadius: "10px" } }}
    >
      <DialogContent dividers={true} sx={{ padding: 0 }}>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
          >
            <Box role="presentation">{getComponent()}</Box>
          </DialogContentText>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default Drawer;
