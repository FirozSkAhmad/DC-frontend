import "./Billing.css";
import Loader from "./Loader";
import sharedContext from "../context/SharedContext";
import { useState, useContext, useEffect } from "react";
import SideNav from "./SideNav";
import easyinvoice from "easyinvoice";
import { TextField, Autocomplete } from "@mui/material";
import toast from "react-hot-toast";

const Billing = () => {
  const { userRole, isSideNavOpen, setLoader, token } =
    useContext(sharedContext);

  const clientName = sessionStorage.getItem("clientName");
  const storeName = sessionStorage.getItem("storeName");

  const [availableProductsNms, setAvailableProductsNms] = useState([]);
  const [availableSubEntites, setAvailableSubEntites] = useState([]);

  const [products, setProducts] = useState([
    { productId: "", productName: "", subEntity: "", quantity: "", price: "" },
  ]);

  const [totalPrice, setTotalPrice] = useState(0);

  const addProduct = () => {
    setProducts([
      ...products,
      {
        productId: "",
        productName: "",
        subEntity: "",
        quantity: "",
        price: "",
      },
    ]);
    toast.success("Added new product row");
  };

  const handleProductChange = async (index, fieldName, value) => {
    const updatedProducts = [...products];
    updatedProducts[index][fieldName] = value;

    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    if (fieldName === "productName") {
      // Fetch product name based on selected part number
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/admin/getProductSubEntites/${value}`,
          requestOptions
        );
        if (response.ok) {
          const obj = await response.json();
          updatedProducts[index].subEntity = "";
          updatedProducts[index].productId = "";
          setAvailableSubEntites(obj.data);
        } else {
          console.error("Failed to fetch SubEntites");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }

    if (fieldName === "subEntity") {
      // Fetch product name based on selected part number
      // console.log(updatedProducts[index].productName, value);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/admin/getProductIdByProductNameAndSubEntity/${updatedProducts[index].productName}/${value}`,
          requestOptions
        );
        if (response.ok) {
          const obj = await response.json();
          updatedProducts[index].productId = obj.productId;
        } else {
          console.error("Failed to fetch product name");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }

    setProducts(updatedProducts);
    const newTotalPrice = updatedProducts.reduce(
      (sum, product) =>
        sum +
        parseFloat(product.price || 0) * parseFloat(product.quantity || 1),
      0
    );
    setTotalPrice(newTotalPrice);
  };

  const handleRemoveProduct = (indexToRemove) => {
    if (products.length <= 1) {
      toast.error("Cann't remove the last product row.");
      return;
    }

    setProducts(products.filter((_, index) => index !== indexToRemove));

    const newTotalPrice = products.reduce(
      (sum, product) => sum + parseFloat(product.price || 0),
      0
    );
    setTotalPrice(newTotalPrice);
    toast.success("Product row removed");
  };

  useEffect(() => {
    const fetchProductNames = async () => {
      try {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);

        var requestOptions = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow",
        };
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/admin/getAllProductNames`,
          requestOptions
        );
        if (response.ok) {
          const obj = await response.json();
          setAvailableProductsNms(obj.data);
        } else {
          console.error("Failed to fetch part numbers");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchProductNames();
  }, []);

  const clearFields = () => {
    setProducts([
      {
        productId: "",
        productName: "",
        subEntity: "",
        quantity: "",
        price: "",
      },
    ]);
    setTotalPrice(0);
  };

  function formatDate(date) {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();
    return `${day}-${month}-${year}`;
  }

  const submitBill = async (event) => {
    event.preventDefault();
    try {
      const convertedProducts = products.map((product) => {
        return {
          quantity: parseInt(product.quantity) || 0, // Assuming order_qty is a string representing an integer
          description: product.productName || "Product", // Assuming a default description if none is provided
          "tax-rate": 6, // Assuming a fixed tax rate of 6%
          price: parseFloat(product.price) || 0.0, // Assuming price is a string representing a float
        };
      });

      const currentDate = new Date();
      const formattedCurrentDate = formatDate(currentDate);

      const data = {
        // Your own data
        sender: {
          company: "Sample Corp",
          address: "Sample Street 123",
          zip: "1234 AB",
          city: "Sampletown",
          country: "Samplecountry",
        },
        // Your recipient
        client: {
          company: "Client Corp",
          address: "Clientstreet 456",
          zip: "4567 CD",
          city: "Clientcity",
          country: "Clientcountry",
        },
        information: {
          // Invoice number
          number: "2021.0001",
          // Invoice data
          date: formattedCurrentDate,
          // Invoice due date
        },
        // The products you would like to see on your invoice
        // Total values are being calculated automatically
        products: convertedProducts,
        // The message you would like to display on the bottom of your invoice
        "bottom-notice": "Kindly pay your invoice within 15 days.",
        // Settings to customize your invoice
        settings: {
          currency: "INR",
        },
      };
      setLoader(true);
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/billing/createNewBill`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            storeName: storeName,
            clientName: clientName,
            products: products,
            orderedDate: formattedCurrentDate,
            totalPrice: totalPrice,
          }),
        }
      );

      if (response.ok) {
        // Handle success
        console.log("Bill created successfully");
        const result = await easyinvoice.createInvoice(data);
        easyinvoice.download("myInvoice.pdf", result.pdf);
        setLoader(false);
        toast.success("Invoice downloaded successfully");
        clearFields();
      } else {
        // Handle error
        console.error("Failed to create bill");
        toast.error("Error in Billing");
        clearFields();
        setLoader(false);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  return (
    <div className="billing_box">
      <Loader />
      {availableProductsNms.length !== 0 ? (
        <div className="w-full text-left border-separate border-spacing-y-2.5">
          <div
            className="flex flex-col gap-10 bg-white p-5 overflow-x-auto custom-scrollbar"
            style={{ borderRadius: "4px" }}
          >
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-20">Name:</p>
                <p>{clientName}</p>
              </div>
              <div className="add__Btn" onClick={addProduct}>
                <button>Add Product</button>
              </div>
            </div>
            <div className="heading-row">
              <div className="text__Fld text-center font-semibold text-20">
                Product Name
              </div>
              <div className="text__Fld text-center font-semibold text-20">
                Sub Entity
              </div>
              <div className="auto__Fld text-center font-semibold text-20">
                Product Id
              </div>
              <div className="text__Fld text-center font-semibold text-20">
                Order Quantity
              </div>
              <div className="text__Fld text-center font-semibold text-20">
                Price
              </div>
              <div className="sbt__Btn text-center font-semibold text-20">
                Actions
              </div>
            </div>
            <form onSubmit={submitBill} className="flex flex-col gap-5">
              {products.map((product, index) => (
                <>
                  <div key={index} className="product-details-row">
                    <Autocomplete
                      className="auto__Fld"
                      options={availableProductsNms}
                      value={product.productName}
                      onChange={(event, newValue) =>
                        handleProductChange(index, "productName", newValue)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select Product Name"
                          variant="outlined"
                          fullWidth
                          required
                        />
                      )}
                    />
                    <Autocomplete
                      className="auto__Fld"
                      options={availableSubEntites}
                      value={product.subEntity}
                      onChange={(event, newValue) =>
                        handleProductChange(index, "subEntity", newValue)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select Sub Entity"
                          variant="outlined"
                          fullWidth
                          required
                        />
                      )}
                    />
                    <TextField
                      className="text__Fld"
                      status="text"
                      value={product.productId}
                      onChange={(e) =>
                        handleProductChange(index, "productId", e.target.value)
                      }
                      placeholder="Enter Product Id"
                      required
                      autoComplete="off"
                      name="productId"
                      disabled
                    />
                    <TextField
                      className="text__Fld"
                      status="text"
                      value={product.quantity}
                      onChange={(e) =>
                        handleProductChange(index, "quantity", e.target.value)
                      }
                      placeholder="Enter Order Quantity"
                      required
                      autoComplete="off"
                      name="order_qty"
                    />
                    <TextField
                      className="text__Fld"
                      status="text"
                      value={product.price}
                      onChange={(e) =>
                        handleProductChange(index, "price", e.target.value)
                      }
                      placeholder="Price"
                      required
                      autoComplete="off"
                      name="price"
                    />
                    <button
                      type="button" // Ensure this button doesn't submit the form
                      className="remove-btn"
                      onClick={() => handleRemoveProduct(index)}
                      style={{ color: "red" }}
                    >
                      Remove
                    </button>
                  </div>
                  <div key={index} className="product-details-col">
                    <div className="deatails__Fld">
                      <p>Product Name</p>
                      <Autocomplete
                        className="auto__Fld"
                        options={availableProductsNms}
                        value={product.productName}
                        onChange={(event, newValue) =>
                          handleProductChange(index, "productName", newValue)
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Select Product Name"
                            variant="outlined"
                            fullWidth
                            required
                          />
                        )}
                      />
                    </div>
                    <div className="deatails__Fld">
                      <p>Sub Entity</p>
                      <Autocomplete
                        className="auto__Fld"
                        options={availableSubEntites}
                        value={product.subEntity}
                        onChange={(event, newValue) =>
                          handleProductChange(index, "subEntity", newValue)
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Select Sub Entity"
                            variant="outlined"
                            fullWidth
                            required
                          />
                        )}
                      />
                    </div>
                    <div className="deatails__Fld">
                      <p>Product Id</p>
                      <TextField
                        className="text__Fld"
                        status="text"
                        value={product.productId}
                        onChange={(e) =>
                          handleProductChange(
                            index,
                            "productId",
                            e.target.value
                          )
                        }
                        placeholder="Enter Product Id"
                        required
                        autoComplete="off"
                        name="productId"
                        disabled
                      />
                    </div>
                    <div className="deatails__Fld">
                      <p>Order Quantity</p>
                      <TextField
                        className="text__Fld"
                        status="text"
                        value={product.quantity}
                        onChange={(e) =>
                          handleProductChange(index, "quantity", e.target.value)
                        }
                        placeholder="Enter Order Quantity"
                        required
                        autoComplete="off"
                        name="order_qty"
                      />
                    </div>
                    <div className="deatails__Fld">
                      <p>Price</p>
                      <TextField
                        className="text__Fld"
                        status="text"
                        value={product.price}
                        onChange={(e) =>
                          handleProductChange(index, "price", e.target.value)
                        }
                        placeholder="Price"
                        required
                        autoComplete="off"
                        name="price"
                      />
                    </div>
                    <div className="deatails__Fld">
                      <p>Actions</p>
                      <button
                        type="button"
                        className="remove-btn "
                        onClick={() => handleRemoveProduct(index)}
                        style={{ color: "red" }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </>
              ))}

              <div className="total-price flex gap-1">
                <p className="font-semibold text-20">Total Price :</p>
                <p>{totalPrice}</p>
              </div>
              <div className="genBill__Btn">
                <button type="submit">Submit</button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <p
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          No products for billing
        </p>
      )}
      <div className={`side_nav ${isSideNavOpen ? "open" : ""}`}>
        <SideNav />
      </div>
    </div>
  );
};

export default Billing;
